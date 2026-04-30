# Snap3D Hierarchy Explained

## 🎯 Understanding ExampleSnap3D

### The 3 Stages of Snap3D Generation

Snap3D generates content in **3 sequential stages**, each with its own event:

```
1. "image" event      → Preview texture (2D image of what will be generated)
2. "base_mesh" event  → Low-quality 3D model (fast, rough)
3. "refined_mesh" event → High-quality 3D model (slow, detailed)
```

### ExampleSnap3D Hierarchy

```
ExampleSnap3D
├── ImageRoot (Image component)
│   ├── [Child 0] - (image displays here)
│   └── [Child 1] - ImageSpinner
│
├── BaseMeshRoot (SceneObject)
│   ├── [Child 0] - (base mesh instantiates here)
│   └── [Child 1] - BaseMeshSpinner
│
└── RefinedMeshRoot (SceneObject)
    ├── [Child 0] - (refined mesh instantiates here)
    └── [Child 1] - RefinedMeshSpinner
```

### Why 3 Separate Roots?

ExampleSnap3D shows **all 3 stages simultaneously**:
- Preview image stays visible
- Base mesh appears (rough quality)
- Refined mesh appears (high quality)
- User can compare all 3 versions

---

## 🎨 structAR Approach (Simplified)

For structAR, we only need **ONE** 3D display (not all 3 stages), so our hierarchy is simpler:

### structAR Hierarchy

```
StructARModel3DPanel
└── ModelRoot (SceneObject)
    ├── [Child 0] - (3D model instantiates here)
    └── [Child 1] - ModelSpinner
```

### How structAR Handles Events

```typescript
// In StructARController.ts:
result.event.add(([eventType, data]) => {
  if (eventType === "image") {
    // Just log it, don't display
    this.setStatus("3D preview: " + partName);
  } 
  else if (eventType === "base_mesh") {
    // Show the base mesh (replaces spinner)
    this.show3DModel(gltfData.gltfAsset, partName);
  } 
  else if (eventType === "refined_mesh") {
    // Replace base mesh with refined version
    this.show3DModel(gltfData.gltfAsset, partName + " (refined)");
  }
});
```

**Key difference:** We **replace** the model instead of showing all versions.

---

## ✅ Current Implementation Status

### StructARImagePanel (for Imagen diagrams)

**Purpose:** Display Imagen-generated diagrams (NOT Snap3D preview images)

**Hierarchy:**
```
ImageObject (has Image component)
├── [Child 0] - (empty)
└── [Child 1] - ImageSpinner ← Auto-found by script
```

**Code:**
```typescript
this.loadingSpinner = this.imageComponent.getSceneObject().getChild(1);
```

### StructARModel3DPanel (for Snap3D models)

**Purpose:** Display Snap3D-generated 3D models (base_mesh and refined_mesh)

**Hierarchy:**
```
ModelRoot (empty SceneObject)
├── [Child 0] - (models instantiate here)
└── [Child 1] - ModelSpinner ← Auto-found by script
```

**Code:**
```typescript
this.loadingSpinner = this.modelRoot.getChild(1);
```

---

## 🔧 Setup Instructions

### For structAR Image Panel (Imagen Diagrams)

1. Find the SceneObject that has your **Image component**
2. Add a child object at index 1:
   ```
   Right-click on ImageObject → Create → Scene Object
   ```
3. Name it "ImageSpinner"
4. Add a loading visual (mesh, animation, or text)
5. Done! Script auto-finds it.

### For structAR 3D Model Panel (Snap3D Models)

1. Find your **ModelRoot** SceneObject (empty object where models spawn)
2. Add a child object at index 1:
   ```
   Right-click on ModelRoot → Create → Scene Object
   ```
3. Name it "ModelSpinner"
4. Add a loading visual (mesh, animation, or text)
5. Done! Script auto-finds it.

---

## 📊 Comparison Table

| Feature | ExampleSnap3D | structAR |
|---------|---------------|----------|
| **Preview Image** | Shows in ImageRoot | Ignored (just logged) |
| **Base Mesh** | Shows in BaseMeshRoot | Shows in ModelRoot |
| **Refined Mesh** | Shows in RefinedMeshRoot | Replaces base in ModelRoot |
| **Display Strategy** | Show all 3 simultaneously | Show only latest version |
| **Spinners** | 3 separate (image, base, refined) | 1 spinner (for model) |
| **Use Case** | Demo/comparison tool | Production AR assistant |

---

## 🎯 Why structAR is Simpler

**ExampleSnap3D** is a **demo/testing tool** that shows:
- How Snap3D works internally
- All 3 generation stages
- Quality comparison

**structAR** is a **production AR assistant** that:
- Only shows the final result to users
- Replaces low-quality with high-quality automatically
- Simpler UI (one model display, not three)

---

## 🔍 Event Flow Comparison

### ExampleSnap3D Flow
```
User taps
  ↓
All 3 spinners show
  ↓
"image" → Show preview, hide image spinner
  ↓
"base_mesh" → Show base model, hide base spinner
  ↓
"refined_mesh" → Show refined model, hide refined spinner
  ↓
All 3 visible simultaneously
```

### structAR Flow
```
User asks for 3D
  ↓
Model panel shows with spinner
  ↓
"image" → Just log status (don't display)
  ↓
"base_mesh" → Show model, hide spinner
  ↓
"refined_mesh" → Replace with better version
  ↓
Only final model visible
```

---

## ✅ Verification

When you run structAR, you should see:

```
[3DPanel] Found loading spinner at modelRoot.getChild(1)
[3DPanel] Initialized
[3DPanel] showLoading called for: Measuring Tape
[3DPanel] Setting panel visible...
[3DPanel] Panel visibility set to: true
[3DPanel] Loading spinner enabled
[3DPanel] ✅ Loading state visible

[structAR] 3D preview: Measuring Tape
[structAR] 3D ready: Measuring Tape
[3DPanel] ✅ Model instantiated: Measuring Tape

[structAR] 3D refined: Measuring Tape (refined)
[3DPanel] ✅ Model instantiated: Measuring Tape (refined)
```

---

## 🚀 Summary

**Your understanding is correct!**

- ✅ ExampleSnap3D has 3 separate roots (image, base, refined)
- ✅ Each root has a spinner at child[1]
- ✅ structAR only needs 1 root (for the final model)
- ✅ Our implementation follows the same child[1] pattern
- ✅ We just have a simpler hierarchy for production use

**The code is correct - just needs the spinner added as child[1] of ModelRoot!**
