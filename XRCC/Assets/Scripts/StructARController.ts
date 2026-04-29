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

  // ── Internals ──────────────────────────────────────────────────────────────
  private audioProcessor: AudioProcessor = new AudioProcessor();
  private videoController: VideoController = new VideoController(
    2000,
    CompressionQuality.IntermediateQuality,
    EncodingType.Jpg
  );

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
    "Call generate_3d_model when showing a specific component in 3D would help the user identify or orient a part. Use sparingly as 3D generation takes about 60 seconds. " +
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

    this.setStatus("Initializing...");

    // Delay initialization until OnStartEvent so all components are awake
    this.createEvent("OnStartEvent").bind(() => {
      this.delayedInit();
    });
  }

  private delayedInit() {
    if (this.dynamicAudioOutput && typeof this.dynamicAudioOutput.initialize === "function") {
      this.dynamicAudioOutput.initialize(24000);
    }
    if (this.microphoneRecorder && typeof this.microphoneRecorder.setSampleRate === "function") {
      this.microphoneRecorder.setSampleRate(16000);
    }
    this.connect();
  }

  // ── Resolve a SceneObject to its first ScriptComponent ────────────────────
  private resolveScript(obj: SceneObject, label: string): any {
    if (!obj) {
      print("[structAR] WARNING: " + label + " not assigned in inspector");
      return null;
    }
    const sc = obj.getComponent("ScriptComponent") as any;
    if (!sc) {
      print("[structAR] WARNING: no ScriptComponent found on " + label);
    }
    return sc;
  }

  // ── Connection ─────────────────────────────────────────────────────────────
  private connect() {
    this.setStatus("Connecting to Gemini...");
    this.geminiLive = Gemini.liveConnect();

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
      print("[structAR] WS closed: " + (e.reason || ""));
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
            "Generate a 3D model of a specific component or part so the user can see it from all angles and identify it. Use this when the user needs to identify a specific part or understand its 3D shape. Note: takes 30 to 90 seconds to generate.",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description:
                  "Text description of the 3D object to generate. Be specific about shape, size, and material. Example: cam lock nut, cylindrical metal furniture connector, 15mm diameter, silver",
              },
              part_name: {
                type: "string",
                description:
                  "Human-readable name of the part shown to the user. Example: Cam Lock Nut",
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
      prompt: prompt,
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
          }
        });
      })
      .catch((err) => {
        print("[structAR] Snap3D submit error: " + err);
        this.setStatus("3D generation failed");
      });
  }

  private show3DModel(gltfAsset: GltfAsset, partName: string) {
    if (this.model3DPanel && typeof this.model3DPanel.showModelFromController === "function") {
      this.model3DPanel.showModelFromController(gltfAsset, partName);
    }
  }

  // ── Streaming ──────────────────────────────────────────────────────────────
  private startStreaming() {
    if (!this.microphoneRecorder) {
      print("[structAR] ERROR: microphoneRecorder not resolved");
      return;
    }

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
    delay.reset(3.0);
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────
  private setStatus(text: string) {
    if (this.statusDisplay) this.statusDisplay.text = text;
    print("[structAR] " + text);
  }

  private setTranscript(text: string) {
    if (this.transcriptDisplay) {
      const trimmed = text.length > 200 ? "..." + text.slice(-197) : text;
      this.transcriptDisplay.text = trimmed;
    }
  }
}
