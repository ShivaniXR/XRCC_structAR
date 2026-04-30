# Object Detection & Labeling Setup Guide

## 🎯 New Features

1. ✅ **Spinner hides when 3D model is ready** (already working)
2. ✅ **Highlight real objects in the scene** (new)
3. ✅ **Label objects with floating text** (new)

---

## 🔧 Setup Instructions

### Step 1: Create Label Prefab

1. **Create a new SceneObject:**
   - Right-click in Objects panel → Create → Scene Object
   - Name it "ObjectLabel"

2. **Add Text component:**
   - Select ObjectLabel
   - Add Component → Text
   - Configure text:
     - Text: "Label"
     - Font size: 20-30
     - Color: White or bright color
     - Alignment: Center

3. **Optional: Add background:**
   - Right-click ObjectLabel → Create → Image
   - Name it "LabelBackground"
   - Set as child of ObjectLabel
   - Configure:
     - Color: Semi-transparent black (0, 0, 0, 0.7)
     - Stretch to fit text

4. **Create Prefab:**
   - Drag ObjectLabel from Objects panel to Resources panel
   - This creates an ObjectPrefab
   - You can now delete the original ObjectLabel from scene

### Step 2: Create ObjectDetectionManager

1. **Create SceneObject:**
   - Right-click in hierarchy → Create → Scene Object
   - Name it "ObjectDetectionManager"
   - Place it under your StructAR root or Camera

2. **Add Component:**
   - Select ObjectDetectionManager
   - Add Component → ObjectDetectionManager

3. **Configure in Inspector:**
   - **labelPrefab**: Drag the ObjectLabel prefab from Resources
   - **highlightMaterial**: (optional) Drag a bright material for highlighting
   - **maxLabels**: 10 (or your preferred max)
   - **labelDistance**: 100 (distance from camera)
   - **labelScale**: 5 (size of labels)

### Step 3: Wire to StructARController

1. **Select StructARController object**

2. **Find StructARController component**

3. **Wire new inputs:**
   - **objectDetectionManagerObj**: Drag ObjectDetectionManager SceneObject
   - **enableObjectDetection**: Check this box (true)

### Step 4: Test

1. **Run the project**

2. **Ask Gemini to label something:**
   - "Can you label the parts I need to assemble?"
   - "Show me which screw goes where"
   - "Highlight the important components"

3. **Expected behavior:**
   - Gemini identifies objects in camera view
   - Floating labels appear on objects
   - Labels stay positioned in 3D space

---

## 🎨 How It Works

### Gemini's Perspective

Gemini can see your camera feed and identify objects. When you ask it to highlight or label something:

1. **Gemini analyzes the camera view**
2. **Identifies object positions** (screen coordinates 0-1)
3. **Calls `label_object` tool** with object name and position
4. **Label appears** in AR at that location

### Example Conversation

```
User: "What parts do I need for this shelf?"

Gemini: "I can see you have the shelf panels and hardware. 
         Let me label the key components."
         [Calls label_object for each part]

User: "Which screws go in first?"

Gemini: "Use the long screws I've labeled on the left."
         [Labels specific screws]

User: "Okay, moving to the next step"

Gemini: "Great! Let me clear these labels."
         [Calls clear_labels]
```

---

## 🎯 Tool Capabilities

### `label_object`

**When Gemini calls this:**
- Places a floating text label in AR
- Label shows object name
- Positioned based on where Gemini sees it in camera

**Parameters:**
- `object_name`: "Left Leg", "Top Screw", "Power Button"
- `screen_x`: 0.0 (left) to 1.0 (right)
- `screen_y`: 0.0 (top) to 1.0 (bottom)

**Example:**
```
Gemini sees a screw at the top-right of the camera view:
- object_name: "Mounting Screw"
- screen_x: 0.8 (right side)
- screen_y: 0.2 (near top)
```

### `clear_labels`

**When Gemini calls this:**
- Removes all floating labels
- Cleans up the AR view
- Called when moving to new step

**No parameters needed**

---

## 🎨 Customization Options

### Label Appearance

Edit the ObjectLabel prefab to customize:

**Text Style:**
```
- Font: Choose from available fonts
- Size: 20-40 for readability
- Color: Bright colors (white, yellow, cyan)
- Outline: Add for better visibility
```

**Background:**
```
- Add Image component as child
- Semi-transparent background
- Rounded corners (if using custom material)
```

**Animation:**
```
- Add tween script for fade-in
- Pulse animation for attention
- Billboard behavior (always face camera)
```

### Detection Settings

In ObjectDetectionManager component:

**maxLabels:**
- Default: 10
- Increase for complex assemblies
- Decrease for simpler UI

**labelDistance:**
- Default: 100
- Closer: Labels appear nearer to camera
- Farther: Labels appear deeper in scene

**labelScale:**
- Default: 5
- Larger: More visible but may obstruct view
- Smaller: Less obtrusive but harder to read

---

## 🔍 Advanced Features

### Auto-Cleanup

Labels automatically disappear after 30 seconds if not updated. This prevents clutter from old labels.

**To adjust timeout:**
Edit `ObjectDetectionManager.ts` line ~150:
```typescript
const timeout = 30.0; // Change to your preferred seconds
```

### Label Positioning

Labels are positioned in 3D space based on:
1. Camera position and orientation
2. Screen coordinates from Gemini
3. Fixed distance from camera

**To adjust positioning:**
Edit `labelDistance` in Inspector or modify `screenToWorld()` method.

---

## 🧪 Testing Scenarios

### Test 1: Simple Labeling
```
User: "Label the parts on the table"
Expected: Gemini identifies and labels visible parts
```

### Test 2: Specific Object
```
User: "Show me where the power button is"
Expected: Label appears on power button
```

### Test 3: Multiple Objects
```
User: "Label all the screws I need"
Expected: Multiple labels appear on different screws
```

### Test 4: Clear Labels
```
User: "Remove the labels"
Expected: All labels disappear
```

---

## 🐛 Troubleshooting

### Labels Don't Appear

**Check:**
1. ✅ labelPrefab assigned in ObjectDetectionManager
2. ✅ ObjectDetectionManager wired to StructARController
3. ✅ enableObjectDetection is checked
4. ✅ Console shows `[ObjectDetection] Detected: ...`

### Labels Appear in Wrong Position

**Possible causes:**
- Camera hierarchy issue
- labelDistance too small/large
- Screen coordinates from Gemini are estimates

**Fix:**
- Adjust labelDistance in Inspector
- Ensure ObjectDetectionManager is child of Camera

### Too Many Labels

**Fix:**
- Reduce maxLabels in Inspector
- Ask Gemini to "clear labels" between steps
- Labels auto-expire after 30 seconds

---

## 📊 Console Logs

**Successful labeling:**
```
[structAR] Tool call: label_object args={"object_name":"Left Screw","screen_x":0.3,"screen_y":0.5}
[ObjectDetection] Detected: Left Screw at (0.3, 0.5)
[ObjectDetection] Created label: Left Screw
```

**Clearing labels:**
```
[structAR] Tool call: clear_labels
[ObjectDetection] Clearing all labels
```

---

## 🚀 Usage Tips

### For Best Results

1. **Be specific when asking:**
   - ❌ "Show me the parts"
   - ✅ "Label the screws and brackets"

2. **Clear labels between steps:**
   - "Okay, next step" → Gemini clears old labels

3. **Use for complex assemblies:**
   - Multiple similar parts
   - Hard-to-identify components
   - Spatial relationships

4. **Combine with other tools:**
   - Labels + Diagrams = Clear instructions
   - Labels + 3D models = Part identification
   - Labels + Voice = Complete guidance

---

## ✅ Summary

**New capabilities:**
- ✅ Gemini can label objects it sees in camera
- ✅ Floating AR labels appear on real objects
- ✅ Labels can be cleared when no longer needed
- ✅ Automatic cleanup after 30 seconds
- ✅ Customizable appearance and behavior

**Try it now:**
1. Set up the label prefab
2. Wire ObjectDetectionManager
3. Ask Gemini: "Can you label the parts I need to assemble?"

**Your AR assembly guide just got a lot more powerful!** 🎯
