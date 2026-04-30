# structAR Panel Setup Guide

## Issue 1: Image Panel Not Showing

### Problem
The diagram panel starts invisible and only becomes visible when an image is generated. You also need a loading spinner.

### Solution
I've updated `StructARImagePanel.ts` to:
- Show a loading spinner when generation starts
- Hide spinner and show image when ready
- Keep panel visible throughout

### Required Setup in Lens Studio

1. **Find your StructARImagePanel object** in the scene hierarchy

2. **Add a Loading Indicator** (spinner):
   - Create a child object under the image panel
   - Add a spinning animation or use a loading mesh
   - Name it something like "LoadingSpinner"

3. **Wire the new input**:
   - Select the StructARImagePanel object
   - In the Inspector, find the StructARImagePanel component
   - You'll now see a new input: `loadingIndicator`
   - Drag your spinner object into this field

4. **Initial State**:
   - Keep `panelRoot` **ENABLED** in the scene
   - The script will manage visibility automatically
   - The image component will start hidden
   - The spinner will show during generation

### How It Works Now

```
User asks for help
    ↓
Gemini decides to generate diagram
    ↓
Panel becomes visible with SPINNER + "Generating: [caption]"
    ↓
Image generates (2-5 seconds)
    ↓
Spinner hides, IMAGE appears with caption
```

---

## Issue 2: 3D Model Panel Not Showing

### Problem
The 3D panel isn't showing at all, even the loading spinner.

### Likely Causes

1. **`panelRoot` not assigned** - Most common issue
2. **`panelRoot` is disabled in scene** - Script can't enable it
3. **`model3DPanelObj` not wired in StructARController**

### Debugging Steps

#### Step 1: Check Console Logs

When you run the project, look for these messages:

```
[3DPanel] Initialized
[3DPanel] ⚠️ panelRoot not assigned - panel will not be visible!
```

If you see the warning, the panel isn't wired correctly.

#### Step 2: Verify Scene Hierarchy

Your 3D panel should look like this:

```
StructARModel3DPanel (SceneObject)
├── StructARModel3DPanel (Component)
├── ModelRoot (SceneObject) ← where 3D models spawn
├── LoadingSpinner (SceneObject) ← spinner during generation
└── PartNameText (Text) ← shows part name
```

#### Step 3: Wire Inputs in Inspector

Select the `StructARModel3DPanel` object and verify these inputs:

- ✅ **panelRoot**: The root SceneObject (usually itself or parent)
- ✅ **modelRoot**: Empty SceneObject where models instantiate
- ✅ **modelMaterial**: A material to apply to 3D models (optional)
- ✅ **loadingIndicator**: Spinner object
- ✅ **partNameText**: Text component

#### Step 4: Wire in StructARController

Select the `StructARController` object and verify:

- ✅ **model3DPanelObj**: Drag the StructARModel3DPanel **SceneObject** here

### Enhanced Logging

I've added detailed logging to help debug:

```
[3DPanel] Initialized
[3DPanel] showLoading called for: Measuring Tape
[3DPanel] Setting panel visible...
[3DPanel] Panel visibility set to: true
[3DPanel] Loading indicator enabled
[3DPanel] ✅ Loading state visible
```

If you don't see these logs when 3D generation starts, the script isn't being called.

---

## Quick Fix Checklist

### For Image Panel
- [ ] Add a loading spinner object as a child
- [ ] Wire `loadingIndicator` input in StructARImagePanel component
- [ ] Keep `panelRoot` enabled in scene
- [ ] Test: Ask for assembly help and watch for spinner

### For 3D Panel
- [ ] Verify `panelRoot` is assigned in StructARModel3DPanel component
- [ ] Verify `modelRoot` is assigned
- [ ] Verify `loadingIndicator` is assigned
- [ ] Verify `model3DPanelObj` is wired in StructARController
- [ ] Check console for "[3DPanel]" messages
- [ ] Test: Ask for a safe object (measuring tape, wooden block)

---

## Testing Commands

### Test Image Generation
Say to Gemini:
- "Show me how to hang a picture"
- "I need a diagram of how to assemble this"
- "Can you show me a wiring diagram?"

**Expected:**
1. Panel appears with spinner
2. Caption shows "Generating: [description]"
3. 2-5 seconds later, image appears
4. Spinner disappears

### Test 3D Generation
Say to Gemini:
- "Show me what a measuring tape looks like"
- "I need to see a wooden dowel pin in 3D"
- "Can you generate a 3D model of a plastic connector?"

**Expected:**
1. Panel appears with spinner
2. Text shows "Generating: [part name] (~60 seconds)"
3. 30-90 seconds later, 3D model appears
4. Model slowly rotates
5. Spinner disappears

---

## Common Issues

### "Panel appears but no image"
- Check that Image component has an Unlit material assigned
- Check console for texture decode errors
- Verify `imageComponent` input is wired

### "Spinner never appears"
- Check that `loadingIndicator` is assigned
- Check that spinner object exists in scene
- Verify spinner is a child of the panel

### "3D panel never shows"
- Most likely: `panelRoot` not assigned
- Check console for "[3DPanel] ❌ Cannot set visibility" error
- Verify the panel object exists and is wired

### "3D model generates but doesn't appear"
- Check that `modelRoot` is assigned
- Check console for instantiation errors
- Verify `modelMaterial` is assigned (optional but recommended)

---

## Scene Structure Example

```
StructAR (Root)
├── StructARController (Component)
├── StructARImagePanel
│   ├── StructARImagePanel (Component)
│   │   ├── imageComponent: → ImageObject
│   │   ├── captionText: → CaptionText
│   │   ├── panelRoot: → StructARImagePanel (self)
│   │   └── loadingIndicator: → ImageSpinner
│   ├── ImageObject (Image component)
│   ├── ImageSpinner (loading animation)
│   └── CaptionText (Text component)
│
└── StructARModel3DPanel
    ├── StructARModel3DPanel (Component)
    │   ├── modelRoot: → ModelRoot
    │   ├── loadingIndicator: → ModelSpinner
    │   ├── partNameText: → PartNameText
    │   └── panelRoot: → StructARModel3DPanel (self)
    ├── ModelRoot (empty SceneObject)
    ├── ModelSpinner (loading animation)
    └── PartNameText (Text component)
```

---

## Next Steps

1. **Wire the new inputs** in Lens Studio Inspector
2. **Test with console open** to see debug messages
3. **Report any errors** you see in the console
4. **Verify spinners appear** before content loads

The code is now ready - it just needs proper wiring in the scene!
