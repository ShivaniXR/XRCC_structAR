# Debug 3D Panel Visibility Issue

## 🔍 Problem
System says "Generating 3D" but you can't see the panel or spinner on screen.

---

## 📋 Checklist: What to Check in Lens Studio

### 1. Check Console Logs

When you trigger 3D generation, you should see these logs in order:

```
✅ Expected logs:
[3DPanel] Initialized
[3DPanel] Found loading spinner at modelRoot.getChild(1)
[structAR] Generating 3D: [part name] (~60s)
[3DPanel] showLoading called for: [part name]
[3DPanel] Setting panel visible...
[3DPanel] Panel visibility set to: true
[3DPanel] Loading spinner enabled
[3DPanel] ✅ Loading state visible
```

**If you see:**
- ❌ `[3DPanel] ⚠️ panelRoot not assigned` → panelRoot input is empty
- ❌ `[3DPanel] ❌ Cannot set visibility - panelRoot is null!` → panelRoot not wired
- ❌ `[3DPanel] ⚠️ No spinner found` → No child at index 1 under modelRoot
- ❌ No logs at all → Script not being called

---

### 2. Verify Scene Hierarchy

**Required structure:**

```
StructAR (or your root object)
├── StructARController (Component)
│   └── model3DPanelObj: → StructARModel3DPanel (SceneObject)
│
└── StructARModel3DPanel (SceneObject) ← THIS MUST EXIST
    ├── StructARModel3DPanel (Component) ← Script attached here
    │   ├── modelRoot: → ModelRoot
    │   ├── panelRoot: → StructARModel3DPanel (self reference)
    │   ├── partNameText: → PartNameText
    │   └── modelMaterial: → (optional material)
    │
    ├── ModelRoot (empty SceneObject)
    │   ├── [Child 0] - (models spawn here)
    │   └── [Child 1] - ModelSpinner ← MUST BE HERE
    │
    └── PartNameText (Text component)
```

---

### 3. Inspector Wiring Checklist

#### StructARController Component
- [ ] `model3DPanelObj` is assigned to the **StructARModel3DPanel SceneObject**

#### StructARModel3DPanel Component
- [ ] `panelRoot` is assigned (usually to itself or parent)
- [ ] `modelRoot` is assigned (empty SceneObject where models spawn)
- [ ] `partNameText` is assigned (Text component)
- [ ] `modelMaterial` is assigned (optional but recommended)

---

### 4. Common Issues & Fixes

#### Issue 1: Panel Exists But Is Invisible

**Symptoms:**
- Logs show "Panel visibility set to: true"
- Still can't see anything

**Possible causes:**
1. **Panel is behind camera**
   - Check panel position in scene
   - Move it in front of camera

2. **Panel scale is too small**
   - Check Transform scale
   - Try setting scale to (1, 1, 1) or larger

3. **Panel is on wrong layer**
   - Check Layers in Inspector
   - Make sure camera can see that layer

4. **Parent object is disabled**
   - Check if any parent objects are disabled
   - Enable all parents up to root

**Fix:**
```
1. Select StructARModel3DPanel in hierarchy
2. Check Transform:
   - Position: (0, 0, -100) or in front of camera
   - Rotation: (0, 0, 0)
   - Scale: (1, 1, 1) or larger
3. Check enabled checkbox is checked
4. Check all parent objects are enabled
```

#### Issue 2: Spinner Not Found

**Symptoms:**
- Log shows: `[3DPanel] ⚠️ No spinner found`

**Fix:**
```
1. Select ModelRoot in hierarchy
2. Right-click → Create → Scene Object
3. Name it "ModelSpinner"
4. Make sure it's the SECOND child (index 1)
5. Add a visual (mesh, image, or text)
```

**Verify child order:**
```
ModelRoot
├── [0] - (empty or existing child)
└── [1] - ModelSpinner ← MUST BE AT INDEX 1
```

#### Issue 3: panelRoot Not Assigned

**Symptoms:**
- Log shows: `[3DPanel] ⚠️ panelRoot not assigned`
- Or: `[3DPanel] ❌ Cannot set visibility - panelRoot is null!`

**Fix:**
```
1. Select the object with StructARModel3DPanel component
2. In Inspector, find StructARModel3DPanel component
3. Find the "panelRoot" input field
4. Drag the StructARModel3DPanel SceneObject into it
   (Usually a self-reference)
```

#### Issue 4: Script Not Being Called

**Symptoms:**
- No `[3DPanel]` logs at all when generating

**Possible causes:**
1. `model3DPanelObj` not wired in StructARController
2. Wrong object assigned
3. Script not attached to object

**Fix:**
```
1. Select StructARController object
2. Find StructARController component
3. Find "model3DPanelObj" input
4. Drag the StructARModel3DPanel SCENEOBJECT (not component)
5. Verify the object has StructARModel3DPanel component attached
```

---

### 5. Step-by-Step Verification

#### Step 1: Find the Panel Object
```
1. Open Objects panel
2. Search for "StructARModel3DPanel"
3. If not found, create it:
   - Right-click in hierarchy
   - Create → Scene Object
   - Name it "StructARModel3DPanel"
```

#### Step 2: Attach the Script
```
1. Select StructARModel3DPanel object
2. In Inspector, click "+ Add Component"
3. Search for "StructARModel3DPanel"
4. Add the script component
```

#### Step 3: Create ModelRoot
```
1. Right-click StructARModel3DPanel
2. Create → Scene Object
3. Name it "ModelRoot"
4. Leave it empty (models will spawn here)
```

#### Step 4: Create Spinner
```
1. Right-click ModelRoot
2. Create → Scene Object
3. Name it "ModelSpinner"
4. Add a visual:
   - Option A: Add Image component with loading texture
   - Option B: Add mesh (sphere, plane, etc.)
   - Option C: Add Text component saying "Loading..."
5. Verify it's at child index 1
```

#### Step 5: Create Text
```
1. Right-click StructARModel3DPanel
2. Create → Text
3. Name it "PartNameText"
4. Set default text to "Part Name"
```

#### Step 6: Wire Everything
```
1. Select StructARModel3DPanel object
2. In StructARModel3DPanel component:
   - panelRoot: Drag StructARModel3DPanel (self)
   - modelRoot: Drag ModelRoot
   - partNameText: Drag PartNameText
   - modelMaterial: (optional) Drag a material

3. Select StructARController object
4. In StructARController component:
   - model3DPanelObj: Drag StructARModel3DPanel
```

#### Step 7: Position the Panel
```
1. Select StructARModel3DPanel
2. Set Transform:
   - Position: (0, 0, -100) or where you want it
   - Rotation: (0, 0, 0)
   - Scale: (10, 10, 10) or larger for visibility
```

#### Step 8: Test
```
1. Run the project
2. Check console for initialization logs
3. Trigger 3D generation
4. Watch for visibility logs
```

---

## 🧪 Quick Test

### Test 1: Manual Visibility Toggle
```
1. Run the project
2. In Objects panel, find StructARModel3DPanel
3. Manually toggle the enabled checkbox
4. Can you see it appear/disappear?
```

**If NO:** Panel position/scale/layer issue
**If YES:** Script visibility logic issue

### Test 2: Check Spinner Manually
```
1. Run the project
2. In Objects panel, find ModelRoot → ModelSpinner
3. Manually enable it
4. Can you see the spinner?
```

**If NO:** Spinner has no visual or is positioned wrong
**If YES:** Script isn't enabling it correctly

---

## 📊 Debug Output Template

**Please share these details:**

1. **Console logs when triggering 3D:**
   ```
   [Paste all [3DPanel] logs here]
   ```

2. **Hierarchy structure:**
   ```
   StructARModel3DPanel
   ├── (what's here?)
   └── (what's here?)
   ```

3. **Inspector inputs:**
   - panelRoot: [assigned? to what?]
   - modelRoot: [assigned? to what?]
   - partNameText: [assigned? to what?]

4. **Panel Transform:**
   - Position: (?, ?, ?)
   - Scale: (?, ?, ?)
   - Enabled: [yes/no]

---

## 🎯 Most Likely Issues

Based on "says generating but can't see it":

1. **90% chance:** `panelRoot` not assigned or assigned to wrong object
2. **5% chance:** Panel exists but positioned off-screen
3. **3% chance:** Panel scale too small
4. **2% chance:** Spinner has no visual

**Start with checking panelRoot assignment!**
