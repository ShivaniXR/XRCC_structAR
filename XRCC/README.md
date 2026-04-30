# structAR - Spatial Assembly Intelligence for Spectacles

AI-powered assembly guide running on Snap Spectacles AR glasses.

## Features

- 🎙️ **Gemini Live** - Real-time voice conversation with AI
- 📷 **Camera Vision** - AI sees what you see
- 📊 **Visual Diagrams** - Generates technical illustrations (Imagen)
- 🎨 **3D Models** - Creates 3D parts for identification (Snap3D)
- 🔄 **Context-Aware** - Tracks assembly progress, skips completed steps

## Quick Start

1. Open project in Lens Studio
2. Wire StructARController in Inspector (see `README_OBJECT_DETECTION.md`)
3. Run on Spectacles
4. Point at object and ask: "How do I assemble this?"

## Documentation

- **`README_OBJECT_DETECTION.md`** - Complete system overview and setup
- **`CHANGES_SUMMARY.md`** - Technical implementation details

## Core Scripts

- `StructARController.ts` - Main AI controller
- `StructARImagePanel.ts` - Diagram display
- `StructARModel3DPanel.ts` - 3D model display

## Tools Available to Gemini

1. **generate_diagram** - Creates visual diagrams for clarity
2. **generate_3d_model** - Generates 3D models of parts

## Example Usage

**User**: "How do I build this IKEA shelf?"  
**Gemini**: "I can see you have a KALLAX shelf. Let's start by attaching the legs..."

**User**: "Which hole do I use?"  
**Gemini**: *[Generates labeled diagram showing hole placement]*

**User**: "What does this bracket look like?"  
**Gemini**: *[Generates 3D model of bracket]*

## Requirements

- Snap Lens Studio 5.0+
- Spectacles (2021) or compatible device
- Internet connection (for Gemini/Imagen/Snap3D APIs)

## Status

✅ Gemini Live integration  
✅ Camera streaming  
✅ Imagen diagrams  
✅ Snap3D models  
✅ Voice I/O  
✅ Content filtering  

---

Built with Snap Lens Studio, Google Gemini Live, Imagen, and Snap3D.
