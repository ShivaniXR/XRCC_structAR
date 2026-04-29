# StructAR Scene Setup - Quick Guide

## Step 1: Create the UI (5 minutes)

### Create Orthographic Camera for UI
1. Right-click in hierarchy → **Camera** → **Orthographic Camera**
2. Name it `UI Camera`
3. Set **Render Layer** to a new layer (e.g., Layer 2)
4. Set **Render Order** to 1 (so it renders on top)

### Create Status Text (top of screen)
1. Right-click `UI Camera` → **Screen Transform**
2. Name it `StatusText`
3. Add Component → **Text**
4. In Text component:
   - Set text to "Status: Waiting..."
   - Set font size to 40
   - Set color to white
   - Enable **Background** (so it's visible)
5. In Screen Transform:
   - Set **Anchors** to Top Center
   - Set Y position to -50 (50 units from top)

### Create Transcript Text (bottom of screen)
1. Right-click `UI Camera` → **Screen Transform**
2. Name it `TranscriptText`
3. Add Component → **Text**
4. In Text component:
   - Set text to "Transcript: ..."
   - Set font size to 32
   - Set color to white
   - Enable **Background**
5. In Screen Transform:
   - Set **Anchors** to Bottom Center
   - Set Y position to 50 (50 units from bottom)

## Step 2: Create StructAR Controller (3 minutes)

1. Right-click in hierarchy → **Create Empty**
2. Name it `StructAR`
3. Add Component → **Script** → `StructARController.ts`

## Step 3: Wire StructARController (5 minutes)

Select `StructAR`, in Inspector find `StructARController`:

### Required Inputs (drag from hierarchy):
- `websocketRequirementsObj` ← `RemoteServiceGatewayExamples > WebSocketRequirements`
- `dynamicAudioOutputObj` ← `RemoteServiceGatewayExamples > DynamicAudioOutput`
- `microphoneRecorderObj` ← `RemoteServiceGatewayExamples > MicrophoneRecorder`
- `transcriptDisplay` ← `UI Camera > TranscriptText` (the Text component)
- `statusDisplay` ← `UI Camera > StatusText` (the Text component)

### Optional Inputs (can leave empty for now):
- `imagenPanelObj` ← leave empty (diagrams won't show but voice will work)
- `model3DPanelObj` ← leave empty (3D won't show but voice will work)

### Settings:
- `haveVideoInput` ← ✅ CHECK THIS
- `voice` ← pick "Aoede" or "Puck"

## Step 4: Disable Conflicting Examples (1 minute)

In hierarchy, find and **UNCHECK** (disable) these:
- `RemoteServiceGatewayExamples > ExampleGeminiLive`
- `RemoteServiceGatewayExamples > ExampleOpenAIRealtime`
- `RemoteServiceGatewayExamples > ExampleDeepseekCalls`

## Step 5: Set API Tokens (1 minute)

Select `RemoteServiceGatewayExamples > RemoteServiceGatewayCredentials`:
- Set **Google Token** (get from https://aistudio.google.com/apikey)
- Set **Snap Token** (optional, only needed for 3D models)

## Step 6: Test (1 minute)

Hit **Play** in Lens Studio. Check console for:
```
=== StructAR Debug Helper ===
  websocketRequirementsObj: ✅
  dynamicAudioOutputObj: ✅
  microphoneRecorderObj: ✅
  transcriptDisplay: ✅
  statusDisplay: ✅
  ...
[structAR] Initializing...
[structAR] Connecting to Gemini...
[structAR] WebSocket open
[structAR] Setup complete, starting streams
[structAR] Ready — point at something to assemble
```

You should see:
- **Top of screen**: "Status: Ready — point at something to assemble"
- **Bottom of screen**: "Transcript: ..." (will update when Gemini speaks)

## Troubleshooting

### "Can't see text"
- Make sure UI Camera **Render Order** is 1 (renders on top)
- Make sure Text components have **Background enabled** (visible against any background)
- Check Text **Layer** matches UI Camera **Render Layer**

### "No console logs"
- Make sure `StructAR` object is **enabled**
- Make sure `StructARController` script is **enabled**
- Check for red errors in console

### "WebSocket error"
- Check your Google API token is valid
- Make sure you have internet in Lens Studio preview

## Next: Add Diagram Panel (optional, 5 minutes)

Only do this after voice is working:

1. Create empty SceneObject under `StructAR` → name it `DiagramPanel`
2. Set it to **disabled** (uncheck in hierarchy)
3. Add Component → Script → `StructARImagePanel.ts`
4. Under `DiagramPanel`, create:
   - **Image** component → name it `DiagramImage`
   - **Text** component → name it `DiagramCaption`
5. Wire `StructARImagePanel`:
   - `imageComponent` ← `DiagramImage`
   - `captionText` ← `DiagramCaption`
   - `panelRoot` ← `DiagramPanel` itself
6. Wire `StructARController`:
   - `imagenPanelObj` ← `DiagramPanel`

## Next: Add 3D Model Panel (optional, 5 minutes)

Only do this after diagrams are working:

1. Create empty SceneObject under `StructAR` → name it `Model3DPanel`
2. Set it to **disabled**
3. Add Component → Script → `StructARModel3DPanel.ts`
4. Under `Model3DPanel`, create:
   - Empty SceneObject → name it `ModelRoot`
   - **Text** component → name it `PartNameText`
   - (Reuse existing LoadingSpinner or create new one)
5. Wire `StructARModel3DPanel`:
   - `modelRoot` ← `ModelRoot`
   - `partNameText` ← `PartNameText`
   - `loadingIndicator` ← `LoadingSpinner`
   - `panelRoot` ← `Model3DPanel` itself
6. Wire `StructARController`:
   - `model3DPanelObj` ← `Model3DPanel`

---

**Priority: Get voice working first. Text visible second. Diagrams and 3D are bonus features.**
