# structAR - Quick Start Guide

## What is structAR?

An AI assembly guide for Snap Spectacles that helps you build anything by:
- Seeing what you see through the camera
- Providing step-by-step voice instructions
- Generating visual diagrams when needed
- Creating 3D models of parts

## 5-Minute Setup

### 1. Open in Lens Studio
- Open the project
- Wait for compilation to complete

### 2. Verify Scene Setup
Check these objects exist:
- ✅ Camera Object (with Device Tracking)
- ✅ StructAR_Controller
- ✅ DiagramPanel
- ✅ Model3DPanel

### 3. Wire StructARController

In Inspector, verify these are assigned:
- **websocketRequirementsObj** → WebSocketRequirements object
- **dynamicAudioOutputObj** → DynamicAudioOutput object
- **microphoneRecorderObj** → MicrophoneRecorder object
- **transcriptDisplay** → Text component (for transcript)
- **statusDisplay** → Text component (for status)
- **imagenPanelObj** → DiagramPanel object
- **model3DPanelObj** → Model3DPanel object
- **haveVideoInput** → ✅ Checked
- **voice** → Choose a voice (Aoede recommended)

### 4. Run It!
- Click Preview or deploy to Spectacles
- Wait for "Ready — point at something to assemble"
- Point camera at an object
- Say: "How do I assemble this?"

## Example Conversations

### Basic Assembly
**You**: "How do I build this IKEA shelf?"  
**Gemini**: "I can see you have a KALLAX shelf. First, attach the four legs to the base panel..."

### Visual Help
**You**: "Which hole do I use?"  
**Gemini**: *[Generates diagram showing hole placement with arrows]*

### Part Identification
**You**: "What does this bracket look like?"  
**Gemini**: *[Generates 3D model of the bracket]*

### Progress Tracking
**You**: "What's next?"  
**Gemini**: "I can see you've already attached the legs. Now let's add the side panels..."

## Available Commands

### Natural Language
- "How do I assemble this?"
- "What's the next step?"
- "Which part goes where?"
- "Show me a diagram"
- "What does this part look like?"
- "I'm stuck, help me"

### Gemini Will Automatically
- Generate diagrams when spatial clarity needed
- Create 3D models when part identification helps
- Skip steps you've already completed
- Adapt to your questions and pace

## Features

### ✅ What Works
- **Voice Conversation** - Natural back-and-forth
- **Camera Vision** - AI sees what you see
- **Visual Diagrams** - Technical illustrations (2-5 sec)
- **3D Models** - Part identification (30-90 sec)
- **Context Awareness** - Tracks your progress

### ⏱️ Generation Times
- Diagrams: 2-5 seconds
- 3D Models: 30-90 seconds (be patient!)

### 🎯 Best For
- Furniture assembly (IKEA, etc.)
- Electronics repair
- Appliance maintenance
- Plumbing fixes
- Lego builds
- Any physical assembly task

## Troubleshooting

### "No audio output"
- Check dynamicAudioOutput is wired
- Verify microphone permissions

### "Can't see camera feed"
- Check haveVideoInput is enabled
- Verify Device Camera Texture assigned

### "Diagrams not showing"
- Check imagenPanel is wired
- Wait 5 seconds for generation
- Look for errors in console

### "3D models not appearing"
- Check model3DPanel is wired
- Wait 60+ seconds (it's slow!)
- Check console for "ALD verification failed"
- Try simpler objects (screws, brackets, etc.)

### "Connection failed"
- Check internet connection
- Verify websocketRequirementsObj is enabled
- Look for WebSocket errors in console

## Tips for Best Results

### For Better Recognition
1. **Good Lighting** - Avoid dark environments
2. **Clear View** - Point camera directly at object
3. **Steady Camera** - Don't move too fast
4. **Close Enough** - Stay 1-2 meters from object

### For Better Instructions
1. **Be Specific** - "How do I attach the left leg?" vs "What now?"
2. **Ask Questions** - Gemini can see and help
3. **Request Visuals** - "Show me a diagram" when confused
4. **Be Patient** - 3D models take time to generate

### For Better 3D Models
Use simple, safe objects:
- ✅ Wooden dowel, plastic bracket, metal screw
- ✅ Furniture connector, cable tie, rubber washer
- ✅ Spring, gear wheel, wooden block
- ❌ Avoid: tools, weapons, complex objects

## Console Messages

### Good Signs
```
[structAR] Setup complete, starting streams
[structAR] Ready — point at something to assemble
[structAR] Tool call: generate_diagram
[structAR] Diagram ready
[structAR] 3D ready: Part Name
```

### Warning Signs
```
[structAR] Connection error. Retrying...
[structAR] Snap3D submit error: ALD verification failed
[structAR] Imagen error: ...
```

## Advanced Usage

### Custom Voice
Change the voice in Inspector:
- Aoede (default, friendly)
- Puck (energetic)
- Kore (calm)
- Charon (deep)
- Fenrir (strong)
- Zephyr (light)

### Debug Mode
Enable StructARDebugHelper for verbose logs

### Modify System Prompt
Edit `SYSTEM_PROMPT` in StructARController.ts to change behavior

## Documentation

- **README.md** - Project overview
- **README_OBJECT_DETECTION.md** - Full system documentation
- **CHANGES_SUMMARY.md** - Technical details
- **CLEANUP_COMPLETE.md** - Recent changes
- **QUICK_START.md** - This file

## Need Help?

1. Check console for error messages
2. Read README_OBJECT_DETECTION.md for details
3. Review CHANGES_SUMMARY.md for technical info
4. Verify all Inspector wiring is correct

## What's Next?

Once it's working:
1. Try different assembly tasks
2. Test diagram generation
3. Test 3D model generation
4. Experiment with different questions
5. Share your experience!

---

**structAR** - Making assembly simple, one step at a time. 🔧✨

Ready to build something? Point your Spectacles at an object and ask Gemini for help!
