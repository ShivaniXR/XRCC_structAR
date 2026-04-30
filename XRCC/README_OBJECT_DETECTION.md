# structAR - Spatial Assembly Intelligence for Spectacles

## Overview
structAR is an AI-powered assembly guide running on Snap Spectacles AR glasses. It uses Gemini Live to provide real-time, context-aware assembly instructions with visual aids.

## Core Features

### ✅ Working Features

1. **Gemini Live Integration**
   - Real-time voice conversation
   - Camera streaming (sees what you see)
   - Context-aware assembly guidance
   - Natural language interaction

2. **Visual Diagrams (Imagen)**
   - Generates technical diagrams on demand
   - Shows part orientation, hole placement, wiring
   - Clean, labeled illustrations
   - Appears in AR view with captions

3. **3D Model Generation (Snap3D)**
   - Creates 3D models of parts
   - Helps identify components
   - Rotates automatically for viewing
   - Takes 30-90 seconds to generate

## How It Works

### Gemini's Capabilities
- **Sees**: Camera feed from your Spectacles
- **Understands**: What you're assembling and current progress
- **Guides**: Step-by-step instructions
- **Adapts**: Skips completed steps, responds to questions

### Tool Calling
Gemini can call two tools:

1. **generate_diagram** - Creates visual diagrams when spatial clarity needed
2. **generate_3d_model** - Generates 3D models of specific parts

### Content Filtering
3D generation has content filters. Safe objects only:
- Wooden dowel, plastic bracket, metal screw
- Furniture connector, cable tie, rubber washer
- Spring, gear wheel, wooden block, plastic tube

## Project Structure

### Core Scripts
- `StructARController.ts` - Main controller, Gemini integration
- `StructARImagePanel.ts` - Diagram display system
- `StructARModel3DPanel.ts` - 3D model display system
- `StructARDebugHelper.ts` - Debug utilities

### Key Components
- Remote Service Gateway - WebSocket communication
- Gemini Live API - AI conversation
- Imagen API - Diagram generation
- Snap3D API - 3D model generation

## Setup Requirements

### Inspector Wiring (StructARController)
- `websocketRequirementsObj` - WebSocket permissions
- `dynamicAudioOutputObj` - Audio playback
- `microphoneRecorderObj` - Audio input
- `transcriptDisplay` - Text component for transcript
- `statusDisplay` - Text component for status
- `imagenPanelObj` - Diagram panel SceneObject
- `model3DPanelObj` - 3D model panel SceneObject
- `haveVideoInput` - Enable camera streaming
- `voice` - Gemini voice selection

### Scene Hierarchy
```
Camera Object
├── Device Tracking (World enabled)
└── Camera

StructAR_Controller
└── StructARController.ts

DiagramPanel
├── DiagramPanelContent (Image)
└── LoadingSpinner

Model3DPanel
├── ModelRoot
│   ├── [3D models spawn here]
│   └── LoadingSpinner
└── ModelName (Text)
```

## Usage

1. **Start the Lens** - Gemini connects automatically
2. **Point at object** - Camera streams to Gemini
3. **Ask questions** - "What is this?", "How do I assemble this?"
4. **Follow instructions** - Gemini guides you step by step
5. **Request visuals** - Gemini generates diagrams/models when helpful

## Example Interactions

**User**: "How do I assemble this IKEA shelf?"
**Gemini**: "I can see you have a KALLAX shelf. First, let's attach the legs to the base..."

**User**: "Which hole do I use?"
**Gemini**: *[Generates diagram showing hole placement]*

**User**: "What does this part look like?"
**Gemini**: *[Generates 3D model of the part]*

## Technical Details

### Gemini Live Configuration
- Model: `gemini-2.0-flash-live-preview-04-09`
- Response: Audio only
- Temperature: 0.7
- Context window: 20K tokens (compresses at limit)
- Video frames: Every 2 seconds

### Performance
- Frame rate: 60 FPS maintained
- Diagram generation: ~2-5 seconds
- 3D generation: 30-90 seconds
- Audio latency: <500ms

### Content Safety
- Snap3D has ALD verification
- Rejects tools, weapons, unsafe objects
- Auto-replaces problematic words
- Falls back to diagrams on rejection

## Known Limitations

1. **3D Generation**
   - Takes 30-90 seconds
   - Content filters can reject prompts
   - Limited to simple, safe objects

2. **Diagrams**
   - AI-generated, may have inaccuracies
   - Best for spatial/visual concepts
   - Not photorealistic

3. **Voice Recognition**
   - Requires clear audio
   - Background noise can interfere

## Troubleshooting

### No Audio Output
- Check dynamicAudioOutput wiring
- Verify audio permissions

### No Camera Feed
- Check haveVideoInput is enabled
- Verify Device Camera Texture assigned

### Diagrams Not Showing
- Check imagenPanel wiring
- Look for errors in console
- Verify spinner hierarchy

### 3D Models Not Appearing
- Check model3DPanel wiring
- Wait 60+ seconds for generation
- Check for ALD verification errors

### Connection Issues
- Check websocketRequirementsObj enabled
- Verify internet connection
- Look for WebSocket errors in console

## Development Notes

### Adding New Features
1. Update system prompt in StructARController
2. Add tool definitions in buildTools()
3. Handle tool calls in handleToolCall()
4. Send responses with sendToolResponse()

### Debugging
- Enable StructARDebugHelper for detailed logs
- Check console for [structAR] prefixed messages
- Monitor WebSocket connection status
- Watch for tool call sequences

## Version History

### Current Version
- ✅ Gemini Live integration
- ✅ Imagen diagram generation
- ✅ Snap3D model generation
- ✅ Voice I/O bidirectional
- ✅ Camera streaming
- ✅ Content filtering
- ✅ Auto-rotation for 3D models
- ✅ Loading spinners
- ❌ Object highlighting (removed - too complex for Spectacles)

## Credits

Built with:
- Snap Lens Studio
- Google Gemini Live API
- Google Imagen API
- Snap3D API
- Remote Service Gateway

---

**structAR** - Making assembly simple, one step at a time. 🔧✨
