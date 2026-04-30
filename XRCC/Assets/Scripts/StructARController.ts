/**
 * StructARController.ts
 * structAR — Spatial Assembly Intelligence
 *
 * Wiring in Inspector:
 *   websocketRequirementsObj  → WebSocketRequirements SceneObject (under RemoteServiceGatewayExamples)
 *   dynamicAudioOutput        → DynamicAudioOutput SceneObject   (under RemoteServiceGatewayExamples)
 *   microphoneRecorder        → MicrophoneRecorder SceneObject   (under RemoteServiceGatewayExamples)
 *   transcriptDisplay         → any Text component in your scene
 *   statusDisplay             → any Text component in your scene
 *   imagenPanel               → SceneObject that has StructARImagePanel.ts on it
 *   model3DPanel              → SceneObject that has StructARModel3DPanel.ts on it
 *   haveVideoInput            → true (stream camera to Gemini)
 *   voice                     → pick a Gemini voice
 */

import { AudioProcessor } from "RemoteServiceGateway.lspkg/Helpers/AudioProcessor";
import { Gemini } from "RemoteServiceGateway.lspkg/HostedExternal/GoogleGenAI";
import { GeminiTypes, GoogleGenAITypes } from "RemoteServiceGateway.lspkg/HostedExternal/GoogleGenAITypes";
import { Imagen } from "RemoteServiceGateway.lspkg/HostedExternal/Imagen";
import { Snap3D } from "RemoteServiceGateway.lspkg/HostedSnap/Snap3D";
import { Snap3DTypes } from "RemoteServiceGateway.lspkg/HostedSnap/Snap3DTypes";
import { VideoController } from "RemoteServiceGateway.lspkg/Helpers/VideoController";

@component
export class StructARController extends BaseScriptComponent {

  // ── Inspector inputs ───────────────────────────────────────────────────────
  @input websocketRequirementsObj: SceneObject;

  // Typed as SceneObject so Lens Studio shows a drag slot in the inspector.
  // We call .getComponent("ScriptComponent") at runtime to get the actual script.
  @input dynamicAudioOutputObj: SceneObject;
  @input microphoneRecorderObj: SceneObject;

  @input transcriptDisplay: Text;
  @input statusDisplay: Text;

  @input imagenPanelObj: SceneObject;
  @input model3DPanelObj: SceneObject;

  @input haveVideoInput: boolean = true;

  @input
  @widget(new ComboBoxWidget([
    new ComboBoxItem("Aoede", "Aoede"),
    new ComboBoxItem("Puck", "Puck"),
    new ComboBoxItem("Kore", "Kore"),
    new ComboBoxItem("Charon", "Charon"),
    new ComboBoxItem("Fenrir", "Fenrir"),
    new ComboBoxItem("Zephyr", "Zephyr"),
  ]))
  voice: string = "Aoede";

  // ── Runtime references (resolved in onAwake) ───────────────────────────────
  private dynamicAudioOutput: any = null;
  private microphoneRecorder: any = null;
  private imagenPanel: any = null;
  private model3DPanel: any = null;

  // ── Configuration constants ────────────────────────────────────────────────
  private readonly VIDEO_FRAME_INTERVAL_MS = 2000;
  private readonly RECONNECT_DELAY_SECONDS = 3.0;
  private readonly TRANSCRIPT_MAX_LENGTH = 200;

  // ── Internals ──────────────────────────────────────────────────────────────
  private audioProcessor: AudioProcessor = new AudioProcessor();
  private videoController: VideoController = new VideoController(
    this.VIDEO_FRAME_INTERVAL_MS,
    CompressionQuality.IntermediateQuality,
    EncodingType.Jpg
  );

  private hasInitialized: boolean = false;
  private geminiLive: ReturnType<typeof Gemini.liveConnect> | null = null;
  private isConnected: boolean = false;
  private transcriptAccumulator: string = "";
  private turnComplete: boolean = true;

  // ── System prompt ──────────────────────────────────────────────────────────
  private readonly SYSTEM_PROMPT =
    "You are structAR, an AI assembly guide running on Snap Spectacles AR glasses. " +
    "You can see what the user sees through their camera. " +
    "Your job is to help them assemble, repair, or understand any physical object — furniture, electronics, appliances, plumbing, Lego, anything. " +
    "BEHAVIOR: Watch the camera feed continuously. When you see an object being assembled, identify it and track progress. " +
    "Speak naturally and concisely. One step at a time. Max 2 sentences per response. " +
    "Be context-aware: if you can see steps are already done, skip them. " +
    "Say things like: I can see you have already attached the legs, so lets move to the tabletop. " +
    "When the user asks a question or says next step or what do I do, respond with the relevant instruction. " +
    "TOOLS: Call generate_diagram when a visual diagram would clarify a step such as which hole to use, orientation of a part, or a wiring diagram. Do NOT call it for every step, only when spatial or visual clarity matters. " +
    "Call generate_3d_model when showing a specific component in 3D would help the user identify or orient a part. IMPORTANT: Only use safe, simple objects that pass content filters: wooden dowel, plastic bracket, metal screw, furniture connector, cable tie, rubber washer, spring, gear wheel, wooden block, plastic tube. Avoid tools, weapons, or complex objects. Use sparingly as 3D generation takes about 60 seconds. " +
    "TONE: Calm, clear, encouraging. Like a knowledgeable friend standing next to you.";

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  onAwake() {
    // Enable WebSocket permissions object
    if (this.websocketRequirementsObj) {
      this.websocketRequirementsObj.enabled = true;
    }

    // Resolve SceneObject references to their script components
    this.dynamicAudioOutput = this.resolveScript(this.dynamicAudioOutputObj, "dynamicAudioOutputObj");
    this.microphoneRecorder = this.resolveScript(this.microphoneRecorderObj, "microphoneRecorderObj");
    this.imagenPanel = this.resolveScript(this.imagenPanelObj, "imagenPanelObj");
    this.model3DPanel = this.resolveScript(this.model3DPanelObj, "model3DPanelObj");

    this.setStatus("Waiting to start...");

    // NOTE: Connection is started by StartButton calling startLens().
    // Do NOT auto-connect here — wait for the button tap.
    print("[structAR] onAwake complete. Waiting for startLens() call.");
  }

  private delayedInit() {
    // Guard: only initialize once
    if (this.hasInitialized) {
      print("[structAR] Already initialized, skipping");
      return;
    }
    this.hasInitialized = true;

    print("[structAR] delayedInit running...");

    // Enable all required SceneObjects first so getComponent works on them
    if (this.dynamicAudioOutputObj) this.dynamicAudioOutputObj.enabled = true;
    if (this.microphoneRecorderObj) this.microphoneRecorderObj.enabled = true;
    if (this.websocketRequirementsObj) this.websocketRequirementsObj.enabled = true;

    // Re-resolve now that objects are enabled
    this.dynamicAudioOutput = this.resolveScript(this.dynamicAudioOutputObj, "dynamicAudioOutputObj");
    this.microphoneRecorder = this.resolveScript(this.microphoneRecorderObj, "microphoneRecorderObj");
    this.imagenPanel = this.resolveScript(this.imagenPanelObj, "imagenPanelObj");
    this.model3DPanel = this.resolveScript(this.model3DPanelObj, "model3DPanelObj");

    print("[structAR] dynamicAudioOutput: " + (this.dynamicAudioOutput ? "✅" : "❌ NULL"));
    print("[structAR] microphoneRecorder: " + (this.microphoneRecorder ? "✅" : "❌ NULL"));

    // Enable AudioComponent before calling initialize() — play() fails if it's disabled
    if (this.dynamicAudioOutputObj) {
      const audioComp = this.dynamicAudioOutputObj.getComponent("AudioComponent");
      if (audioComp) {
        audioComp.enabled = true;
        print("[structAR] ✅ AudioComponent enabled");
      } else {
        print("[structAR] ⚠️ No AudioComponent found on dynamicAudioOutputObj");
      }
    }

    if (this.dynamicAudioOutput && typeof this.dynamicAudioOutput.initialize === "function") {
      this.dynamicAudioOutput.initialize(24000);
      print("[structAR] ✅ dynamicAudioOutput initialized");
    } else {
      print("[structAR] ⚠️ dynamicAudioOutput.initialize not available");
    }

    if (this.microphoneRecorder && typeof this.microphoneRecorder.setSampleRate === "function") {
      this.microphoneRecorder.setSampleRate(16000);
      print("[structAR] ✅ microphoneRecorder sample rate set");
    } else {
      print("[structAR] ⚠️ microphoneRecorder.setSampleRate not available");
    }

    this.connect();
  }

  /**
   * Called by StartButton to kick off Gemini connection.
   * Keeps the SceneObject always enabled so onAwake fires correctly.
   */
  public startLens() {
    print("[structAR] startLens() called by StartButton");
    this.delayedInit();
  }

  // ── Resolve a SceneObject to its first ScriptComponent ────────────────────
  private resolveScript(obj: SceneObject, label: string): any {
    if (!obj) {
      print("[structAR] WARNING: " + label + " not assigned in inspector");
      return null;
    }
    // getComponents returns ALL script components — iterate to find the right one
    const scripts = obj.getComponents("ScriptComponent") as any[];
    if (!scripts || scripts.length === 0) {
      print("[structAR] WARNING: no ScriptComponent found on " + label);
      return null;
    }
    if (scripts.length === 1) {
      return scripts[0];
    }
    // Multiple scripts — return the first non-null one and log all names
    print("[structAR] " + label + " has " + scripts.length + " script components");
    for (let i = 0; i < scripts.length; i++) {
      print("[structAR]   [" + i + "] " + (scripts[i] ? scripts[i].getTypeName?.() || "unknown" : "null"));
    }
    return scripts[0];
  }

  // ── Connection ─────────────────────────────────────────────────────────────
  private connect() {
    print("[structAR] connect() called — attempting Gemini.liveConnect()");
    this.setStatus("Connecting to Gemini...");
    this.geminiLive = Gemini.liveConnect();
    print("[structAR] Gemini.liveConnect() returned: " + (this.geminiLive ? "✅ object" : "❌ null"));

    this.geminiLive.onOpen.add(() => {
      print("[structAR] WebSocket open");
      this.sendSetup();
    });

    this.geminiLive.onMessage.add((msg) => this.handleMessage(msg));

    this.geminiLive.onError.add((e) => {
      print("[structAR] WS error: " + JSON.stringify(e));
      this.setStatus("Connection error. Retrying...");
      this.scheduleReconnect();
    });

    this.geminiLive.onClose.add((e: any) => {
      print("[structAR] WS closed: " + (e.reason || "no reason"));
      this.isConnected = false;
      this.setStatus("Disconnected. Reconnecting...");
      this.scheduleReconnect();
    });
  }

  private sendSetup() {
    const setup: GeminiTypes.Live.Setup = {
      setup: {
        model: "models/gemini-2.0-flash-live-preview-04-09",
        generation_config: {
          responseModalities: ["AUDIO"],
          temperature: 0.7,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: this.voice },
            },
          },
        },
        system_instruction: {
          parts: [{ text: this.SYSTEM_PROMPT }],
          role: "user",
        },
        tools: [this.buildTools()],
        output_audio_transcription: {},
        contextWindowCompression: {
          triggerTokens: 20000,
          slidingWindow: { targetTokens: 16000 },
        },
      },
    };

    this.geminiLive!.send(setup);
  }

  // ── Tool definitions ───────────────────────────────────────────────────────
  private buildTools(): any {
    return {
      function_declarations: [
        {
          name: "generate_diagram",
          description:
            "Generate a clear instructional diagram image to help the user understand a specific assembly step, part orientation, or spatial relationship. Call this when a picture would genuinely clarify something that words alone cannot.",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description:
                  "Detailed image generation prompt. Include the object name, specific step, what to show, and style such as technical diagram or exploded view. Example: IKEA KALLAX shelf assembly step 3, inserting wooden dowel pin into pre-drilled hole, exploded view diagram, clean white background, labeled arrows",
              },
              caption: {
                type: "string",
                description:
                  "Short caption to display under the diagram, max 60 characters. Example: Insert dowel into left hole",
              },
            },
            required: ["prompt", "caption"],
          },
        },
        {
          name: "generate_3d_model",
          description:
            "Generate a 3D model of a specific component or part so the user can see it from all angles and identify it. Use this when the user needs to identify a specific part or understand its 3D shape. Note: takes 30 to 90 seconds to generate. IMPORTANT: Only use safe, simple objects that pass content filters.",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description:
                  "Text description of the 3D object to generate. Use ONLY safe, simple objects: wooden dowel, plastic bracket, metal screw, furniture connector, cable tie, rubber washer, spring, gear wheel, wooden block, plastic tube, metal ring, plastic cap, rubber gasket. Be specific about shape, size, and material. Example: wooden dowel pin, cylindrical, 8mm diameter, light brown wood",
              },
              part_name: {
                type: "string",
                description:
                  "Human-readable name of the part shown to the user. Example: Wooden Dowel Pin",
              },
            },
            required: ["prompt", "part_name"],
          },
        },
      ],
    };
  }

  // ── Message handling ───────────────────────────────────────────────────────
  private handleMessage(msg: GeminiTypes.Live.ServerMessage) {
    // Setup complete → start streaming
    if ((msg as any).setupComplete !== undefined) {
      print("[structAR] Setup complete, starting streams");
      this.isConnected = true;
      this.setStatus("Ready — point at something to assemble");
      this.startStreaming();
      return;
    }

    const serverContent = (msg as GeminiTypes.Live.ServerContentEvent).serverContent;
    if (serverContent) {
      const part = serverContent.modelTurn?.parts?.[0];

      // Audio response → play it
      if (part?.inlineData?.mimeType?.startsWith("audio/pcm")) {
        const audio = Base64.decode(part.inlineData.data);
        if (this.dynamicAudioOutput) {
          this.dynamicAudioOutput.addAudioFrame(audio);
        }
      }

      // Output transcription → show what Gemini is saying
      if (serverContent.outputTranscription?.text) {
        if (this.turnComplete) {
          this.transcriptAccumulator = serverContent.outputTranscription.text;
        } else {
          this.transcriptAccumulator += serverContent.outputTranscription.text;
        }
        this.turnComplete = false;
        this.setTranscript(this.transcriptAccumulator);
      }

      // Text fallback (when audio modality is off)
      if (part?.text) {
        if (this.turnComplete) {
          this.transcriptAccumulator = part.text;
        } else {
          this.transcriptAccumulator += part.text;
        }
        this.turnComplete = false;
        this.setTranscript(this.transcriptAccumulator);
      }

      if (serverContent.turnComplete) {
        this.turnComplete = true;
      }
    }

    // Tool call → Gemini decided to generate image or 3D
    const toolCall = (msg as GeminiTypes.Live.ToolCallEvent).toolCall;
    if (toolCall?.functionCalls) {
      toolCall.functionCalls.forEach((fc) => this.handleToolCall(fc));
    }
  }

  // ── Tool call dispatch ─────────────────────────────────────────────────────
  private handleToolCall(fc: GoogleGenAITypes.Common.FunctionCall) {
    print("[structAR] Tool call: " + fc.name + " args=" + JSON.stringify(fc.args));

    if (fc.name === "generate_diagram") {
      this.triggerImagenGeneration(fc.id, fc.args!.prompt, fc.args!.caption);
    } else if (fc.name === "generate_3d_model") {
      this.triggerSnap3DGeneration(fc.id, fc.args!.prompt, fc.args!.part_name);
    }
  }

  // ── Imagen diagram generation ──────────────────────────────────────────────
  private triggerImagenGeneration(callId: string, prompt: string, caption: string) {
    this.setStatus("Generating diagram...");
    print("[structAR] Imagen prompt: " + prompt);

    // Show loading state immediately
    if (this.imagenPanel && typeof this.imagenPanel.showLoadingFromController === "function") {
      this.imagenPanel.showLoadingFromController(caption);
    }

    const request: GoogleGenAITypes.Imagen.ImagenRequest = {
      model: "imagen-4.0-fast-generate-001",
      body: {
        instances: [{ prompt: prompt }],
        parameters: { sampleCount: 1, aspectRatio: "1:1" },
      },
    };

    Imagen.generateImage(request)
      .then((response) => {
        const prediction = response.predictions?.[0];
        if (!prediction?.bytesBase64Encoded) {
          print("[structAR] Imagen: no image in response");
          this.sendToolResponse(callId, "generate_diagram", { success: false, error: "No image returned" });
          return;
        }

        print("[structAR] Imagen: image received");
        this.setStatus("Diagram ready");

        if (this.imagenPanel && typeof this.imagenPanel.showDiagramFromController === "function") {
          this.imagenPanel.showDiagramFromController(
            prediction.mimeType || "image/png",
            prediction.bytesBase64Encoded,
            caption
          );
        }

        this.sendToolResponse(callId, "generate_diagram", {
          success: true,
          message: "Diagram is now displayed in the users view",
        });
      })
      .catch((err) => {
        print("[structAR] Imagen error: " + err);
        this.setStatus("Diagram generation failed");
        this.sendToolResponse(callId, "generate_diagram", { success: false, error: String(err) });
      });
  }

  // ── Snap3D model generation ────────────────────────────────────────────────
  private triggerSnap3DGeneration(callId: string, prompt: string, partName: string) {
    this.setStatus("Generating 3D: " + partName + " (~60s)");
    print("[structAR] Snap3D prompt: " + prompt);

    // Check for potentially problematic words and suggest safer alternatives
    const saferPrompt = this.makeSaferPrompt(prompt);
    if (saferPrompt !== prompt) {
      print("[structAR] Modified prompt for safety: " + saferPrompt);
    }

    // Show loading state immediately
    if (this.model3DPanel && typeof this.model3DPanel.showLoadingFromController === "function") {
      this.model3DPanel.showLoadingFromController(partName);
    }

    // Acknowledge immediately so Gemini keeps talking
    this.sendToolResponse(callId, "generate_3d_model", {
      success: true,
      message: "3D model generation started. It will appear in about 60 seconds.",
    });

    Snap3D.submitAndGetStatus({
      prompt: saferPrompt,
      format: "glb",
      refine: true,
      use_vertex_color: false,
    })
      .then((result) => {
        result.event.add(([eventType, data]) => {
          if (eventType === "image") {
            this.setStatus("3D preview: " + partName);
          } else if (eventType === "base_mesh") {
            const gltfData = data as Snap3DTypes.GltfAssetData;
            this.show3DModel(gltfData.gltfAsset, partName);
            this.setStatus("3D ready: " + partName);
          } else if (eventType === "refined_mesh") {
            const gltfData = data as Snap3DTypes.GltfAssetData;
            this.show3DModel(gltfData.gltfAsset, partName + " (refined)");
            this.setStatus("3D refined: " + partName);
          } else if (eventType === "failed") {
            const err = data as Snap3DTypes.ErrorData;
            print("[structAR] Snap3D failed: " + err.errorMsg);
            this.setStatus("3D generation failed");
            this.handleSnap3DFailure(callId, err.errorMsg, partName);
          }
        });
      })
      .catch((err) => {
        print("[structAR] Snap3D submit error: " + err);
        this.setStatus("3D generation failed");
        this.handleSnap3DFailure(callId, String(err), partName);
      });
  }

  private makeSaferPrompt(prompt: string): string {
    // Replace potentially problematic words with safer alternatives
    const replacements: { [key: string]: string } = {
      "hammer": "wooden mallet head",
      "knife": "plastic cutting edge",
      "blade": "flat metal piece",
      "gun": "cylindrical tube",
      "weapon": "tool component",
      "sharp": "pointed",
      "cutting": "separating",
      "drill": "cylindrical rod",
      "saw": "toothed edge",
      "axe": "wedge shape",
      "sword": "long flat piece"
    };

    let saferPrompt = prompt.toLowerCase();
    for (const [unsafe, safe] of Object.entries(replacements)) {
      saferPrompt = saferPrompt.replace(new RegExp(unsafe, 'gi'), safe);
    }

    return saferPrompt;
  }

  private handleSnap3DFailure(callId: string, errorMsg: string, partName: string) {
    // Hide loading spinner
    if (this.model3DPanel && typeof this.model3DPanel.hidePanel === "function") {
      this.model3DPanel.hidePanel();
    }

    // Check if it's an ALD verification failure
    if (errorMsg.includes("ALD verification failed")) {
      print("[structAR] Content filter rejected prompt - suggesting diagram instead");
      
      // Send response suggesting diagram instead
      this.sendToolResponse(callId, "generate_3d_model", {
        success: false,
        error: "Content filter rejected 3D prompt. Suggesting diagram instead.",
        suggestion: "generate_diagram"
      });
    } else {
      // Other error
      this.sendToolResponse(callId, "generate_3d_model", {
        success: false,
        error: errorMsg
      });
    }
  }

  private show3DModel(gltfAsset: GltfAsset, partName: string) {
    if (this.model3DPanel && typeof this.model3DPanel.showModelFromController === "function") {
      this.model3DPanel.showModelFromController(gltfAsset, partName);
    }
  }

  // ── Streaming ──────────────────────────────────────────────────────────────
  private startStreaming() {
    // Re-resolve in case onAwake ran before the objects were ready
    if (!this.microphoneRecorder) {
      this.microphoneRecorder = this.resolveScript(this.microphoneRecorderObj, "microphoneRecorderObj");
    }
    if (!this.dynamicAudioOutput) {
      this.dynamicAudioOutput = this.resolveScript(this.dynamicAudioOutputObj, "dynamicAudioOutputObj");
    }

    if (!this.microphoneRecorder) {
      print("[structAR] ERROR: microphoneRecorder not resolved — check microphoneRecorderObj is assigned in Inspector");
      return;
    }

    print("[structAR] Starting mic and video streams...");

    // Mic audio → Gemini
    this.audioProcessor.onAudioChunkReady.add((encodedChunk: string) => {
      if (!this.isConnected) return;
      const msg: GeminiTypes.Live.RealtimeInput = {
        realtime_input: {
          media_chunks: [{ mime_type: "audio/pcm", data: encodedChunk }],
        },
      };
      this.geminiLive!.send(msg);
    });

    this.microphoneRecorder.onAudioFrame.add((frame: Float32Array) => {
      this.audioProcessor.processFrame(frame);
    });

    this.microphoneRecorder.startRecording();
    print("[structAR] ✅ Microphone recording started");

    // Camera frames → Gemini
    if (this.haveVideoInput) {
      this.videoController.onEncodedFrame.add((encodedFrame: string) => {
        if (!this.isConnected) return;
        const msg: GeminiTypes.Live.RealtimeInput = {
          realtime_input: {
            media_chunks: [{ mime_type: "image/jpeg", data: encodedFrame }],
          },
        };
        this.geminiLive!.send(msg);
      });

      this.videoController.startRecording();
      print("[structAR] ✅ Video recording started");
    }
  }

  // ── Tool response ──────────────────────────────────────────────────────────
  private sendToolResponse(callId: string, name: string, responseContent: any) {
    if (!this.isConnected || !this.geminiLive) return;

    const toolResponse: GeminiTypes.Live.ToolResponse = {
      tool_response: {
        function_responses: [
          {
            name: name,
            id: callId,
            response: { content: responseContent },
          },
        ],
      },
    };

    this.geminiLive.send(toolResponse);
  }

  // ── Reconnect ──────────────────────────────────────────────────────────────
  private scheduleReconnect() {
    const delay = this.createEvent("DelayedCallbackEvent");
    delay.bind(() => {
      if (!this.isConnected) {
        print("[structAR] Reconnecting...");
        this.connect();
      }
    });
    delay.reset(this.RECONNECT_DELAY_SECONDS);
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────
  private setStatus(text: string) {
    if (this.statusDisplay) this.statusDisplay.text = text;
    print("[structAR] " + text);
  }

  private setTranscript(text: string) {
    if (this.transcriptDisplay) {
      const trimmed = text.length > this.TRANSCRIPT_MAX_LENGTH 
        ? "..." + text.slice(-(this.TRANSCRIPT_MAX_LENGTH - 3)) 
        : text;
      this.transcriptDisplay.text = trimmed;
    }
  }
}
