# Spinner Setup Guide - ExampleSnap3D Pattern

## 🎯 Key Discovery

After checking ExampleSnap3D, I found the **correct pattern** for spinners:

**Spinners are CHILDREN of the root objects, not separate inputs!**

```typescript
// ExampleSnap3D pattern:
this.loadingSpinner = this.modelRoot.getChild(1);
```

The hierarchy is:
```
Root SceneObject
├── [Child 0] - Content (Image or Model instantiates here)
└── [Child 1] - Loading Spinner ← Automatically found!
```

---

## ✅ Updated Code

I've updated both panel scripts to match ExampleSnap3D:

### StructARImagePanel.ts
- ✅ Removed `loadingIndicator` input
- ✅ Auto-finds spinner at `imageComponent.sceneObject.getChild(1)`
- ✅ No manual wiring needed!

### StructARModel3DPanel.ts
- ✅ Removed `loadingIndicator` input
- ✅ Auto-finds spinner at `modelRoot.getChild(1)`
- ✅ No manual wiring needed!

---

## 🔧 How to Set Up in Lens Studio

### For Image Panel

**Hierarchy Structure:**
```
StructARImagePanel (Root)
├── ImageObject (has Image component)
│   ├── [Child 0] - (empty, or existing content)
│   └── [Child 1] - ImageSpinner ← ADD THIS
├── CaptionText (Text component)
└── (other UI elements)
```

**Steps:**
1. Find your Image object (the one with the Image component)
2. Add a child object to it (Right-click → Create → Scene Object)
3. Name it "ImageSpinner" or similar
4. Add a spinning mesh or animation to it
5. **Make sure it's at child index 1** (second child)
6. The script will automatically find and use it!

### For 3D Model Panel

**Hierarchy Structure:**
```
StructARModel3DPanel (Root)
├── ModelRoot (empty SceneObject)
│   ├── [Child 0] - (models instantiate here automatically)
│   └── [Child 1] - ModelSpinner ← ADD THIS
├── PartNameText (Text component)
└── (other UI elements)
```

**Steps:**
1. Find your ModelRoot object (empty SceneObject where models spawn)
2. Add a child object to it (Right-click → Create → Scene Object)
3. Name it "ModelSpinner" or similar
4. Add a spinning mesh or animation to it
5. **Make sure it's at child index 1** (second child)
6. The script will automatically find and use it!

---

## 📋 Verification

When you run the project, check the console:

### Image Panel
```
[ImagePanel] Found loading spinner at imageComponent.sceneObject.getChild(1)
[ImagePanel] Initialized
```

If you see:
```
[ImagePanel] ⚠️ No spinner found - add a child object at index 1 under image SceneObject
```
Then the spinner isn't set up correctly.

### 3D Model Panel
```
[3DPanel] Found loading spinner at modelRoot.getChild(1)
[3DPanel] Initialized
```

If you see:
```
[3DPanel] ⚠️ No spinner found - add a child object at index 1 under modelRoot
```
Then the spinner isn't set up correctly.

---

## 🎨 Spinner Ideas

You can use any of these for spinners:

1. **3D Loading Indicator** (from Audio Output package)
   - Already in your project!
   - Look in `Audio Output - Record.lspkg/3D Loading Indicator Resources`

2. **Simple Rotating Mesh**
   - Add a plane or sphere
   - Add a rotation animation script

3. **Animated Sprite**
   - Add an Image component
   - Use an animated texture

4. **Text**
   - Just a Text component saying "Loading..."
   - Simple but effective

---

## 🔍 Why This Pattern?

**Advantages of ExampleSnap3D pattern:**

1. ✅ **No manual wiring** - Script finds spinner automatically
2. ✅ **Cleaner inspector** - Fewer inputs to configure
3. ✅ **Consistent with Snap examples** - Follows official patterns
4. ✅ **Less error-prone** - Can't forget to wire the spinner

**How it works:**
- Content (images/models) instantiates at child[0] (or as first child)
- Spinner lives at child[1] (second child)
- Script toggles spinner visibility automatically

---

## 🚀 Quick Setup Checklist

### Image Panel
- [ ] Find the SceneObject that has your Image component
- [ ] Add a child object at index 1 (second child)
- [ ] Add spinner visual (mesh, animation, or text)
- [ ] Run and check console for confirmation

### 3D Model Panel
- [ ] Find your ModelRoot SceneObject (empty object for models)
- [ ] Add a child object at index 1 (second child)
- [ ] Add spinner visual (mesh, animation, or text)
- [ ] Run and check console for confirmation

---

## 🎯 Expected Behavior

### Image Generation Flow
1. User asks for diagram
2. Panel appears with **spinner visible**
3. Caption shows "Generating: [description]"
4. 2-5 seconds later...
5. **Spinner hides**, image appears
6. Caption updates to final text

### 3D Generation Flow
1. User asks for 3D model
2. Panel appears with **spinner visible**
3. Text shows "Generating: [part name] (~60 seconds)"
4. 30-90 seconds later...
5. **Spinner hides**, 3D model appears and rotates
6. Text updates to part name

---

## 🐛 Troubleshooting

### "No spinner found" warning
**Problem:** Spinner isn't at child index 1

**Solution:**
1. Check the object has at least 2 children
2. Make sure spinner is the **second child** (index 1)
3. Reorder children if needed (drag in hierarchy)

### Spinner never shows
**Problem:** Panel isn't becoming visible

**Solution:**
1. Check `panelRoot` is assigned
2. Check console for "[Panel] Panel visibility set to: true"
3. Verify panelRoot isn't disabled by another script

### Spinner shows but doesn't hide
**Problem:** Image/model loading failed

**Solution:**
1. Check console for error messages
2. For images: verify material is Unlit
3. For 3D: verify modelRoot is assigned

---

## 📚 Reference: ExampleSnap3D Pattern

```typescript
// How ExampleSnap3D does it:
private loaderSpinnerImage: SceneObject;
private baseMeshSpinner: SceneObject;

private initalizeSpinners() {
  this.loaderSpinnerImage = this.imageRoot.sceneObject.getChild(1);
  this.baseMeshSpinner = this.baseMeshRoot.getChild(1);
  this.enableSpinners(false);
}

private enableSpinners(enable: boolean) {
  this.loaderSpinnerImage.enabled = enable;
  this.baseMeshSpinner.enabled = enable;
}
```

**We now follow this exact pattern!** ✅

---

## ✨ Summary

**No more manual spinner wiring!** Just add spinner objects as children at index 1, and the scripts will find them automatically.

This matches the official Snap examples and makes setup much simpler.
