// DynamicAudioOutputPlayer.ts
// Drag the RSG DynamicAudioOutput SCRIPT COMPONENT into `dynamicAudioOutputSC`.
// This wrapper waits until that component is awake and supports both direct calls and .api calls.

@component
export class DynamicAudioOutputPlayer extends BaseScriptComponent {
  @input dynamicAudioOutputSC: ScriptComponent  // RSG DynamicAudioOutput script component

  private initialized: boolean = false
  private initAttempts: number = 0
  private maxAttempts: number = 30

  onAwake() {
    // Expose a JS-friendly API so SpectaclesWSClient.js can call it.
    ;(this as any).api = {
      pushPcmBytes: (u8: Uint8Array, sampleRate: number) => {
        this.pushPcmBytes(u8, sampleRate)
      }
    }

    // Delay init so the target component is awake
    this.tryInitDelayed()
  }

  private tryInitDelayed() {
    const delayed = this.createEvent("DelayedCallbackEvent")
    delayed.bind(() => this.tryInitNow())
    delayed.reset(0.0) // next frame
  }

  private getDao(): any | null {
    if (!this.dynamicAudioOutputSC) return null
    const sc: any = this.dynamicAudioOutputSC as any

    // Some scripts expose functions directly, some under .api
    if (typeof sc.initialize === "function" && typeof sc.addAudioFrame === "function") return sc
    if (sc.api && typeof sc.api.initialize === "function" && typeof sc.api.addAudioFrame === "function") return sc.api

    return null
  }

  private tryInitNow() {
    if (this.initialized) return
    this.initAttempts++

    const dao = this.getDao()
    if (!dao) {
      if (this.initAttempts < this.maxAttempts) {
        // keep retrying until the target component wakes up
        this.tryInitDelayed()
      } else {
        print("[AudioOut] ERROR: Could not find initialize/addAudioFrame on DynamicAudioOutput (check wiring).")
      }
      return
    }

    // Initialize for Gemini audio output (PCM16 @ 24kHz)
    try {
      dao.initialize(24000)
      this.initialized = true
      print("[AudioOut] Initialized ✅")
    } catch (e) {
      // If it still isn't awake, retry
      if (this.initAttempts < this.maxAttempts) {
        this.tryInitDelayed()
      } else {
        print("[AudioOut] ERROR: initialize failed after retries: " + e)
      }
    }
  }

  private pushPcmBytes(u8: Uint8Array, sampleRate: number) {
    const dao = this.getDao()
    if (!dao) {
      // Not ready yet; drop frame (or you can buffer, but dropping is fine early on)
      return
    }

    // Many helpers expect (bytes, channels)
    try {
      dao.addAudioFrame(u8, 1)
    } catch (e) {
      // Some versions might expect only bytes
      try {
        dao.addAudioFrame(u8)
      } catch (e2) {
        // give up silently to avoid spam
      }
    }
  }
}
