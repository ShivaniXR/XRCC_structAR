# Start Button Setup Guide

## 🎯 Simple Start Button

This guide shows you how to make your button image start the lens when tapped.

---

## 🚀 Quick Setup (1 Minute!)

### Step 1: Add Script to Button Image

1. **Select your button image** in the hierarchy
2. **Add Component** → Search for "StartButton"
3. **Assign StructAR Controller:**
   - In Inspector, find "Struct AR Controller" field
   - Drag your StructAR_Controller object into it

That's it! ✅

---

## 📋 Inspector Settings

```
StartButton Component
├── Struct AR Controller: [Drag StructAR_Controller here]
└── Collider Size: {x: 10, y: 5, z: 1} (adjust to match your button)
```

---

## 🎨 What It Does

### Automatically:
1. ✅ Adds Interactable component to your button
2. ✅ Adds Collider component to your button
3. ✅ Keeps StructAR controller disabled initially
4. ✅ Enables controller when button is tapped

### When User Taps:
1. User pinches/taps your button image
2. StructAR controller is enabled
3. Gemini Live starts
4. Lens is ready!

---

## 🔧 Adjusting Collider Size

If the button doesn't respond well to taps, adjust the collider size:

```
In Inspector:
Collider Size: {x: width, y: height, z: 1}

Examples:
Small button:  {x: 5,  y: 3, z: 1}
Medium button: {x: 10, y: 5, z: 1}  ← Default
Large button:  {x: 15, y: 8, z: 1}
```

Match the size to your button image dimensions!

---

## 💡 Optional: Hide Button After Tap

If you want the button to disappear after being tapped:

1. Open `Assets/Scripts/StartButton.ts`
2. Find line 78: `// this.sceneObject.enabled = false;`
3. Uncomment it: `this.sceneObject.enabled = false;`

---

## ✅ Expected Console Output

```
[StartButton] Initializing...
[StartButton] ✅ Created Interactable component
[StartButton] ✅ Created collider
[StartButton] ✅ Interaction setup complete
[StartButton] ✅ Ready - tap button to start!

[When tapped]
[StartButton] 🚀 Button tapped!
[StartButton] ✅ StructAR started!
```

---

## 🐛 Troubleshooting

### Button doesn't respond to tap
**Fix:**
- Increase collider size in inspector
- Make sure hand tracking is enabled
- Check console for error messages

### "structARController not assigned" error
**Fix:**
- Select your button image
- In Inspector, assign the StructAR_Controller object

### Button works but nothing happens
**Fix:**
- Make sure you assigned the correct controller object
- Check that StructAR_Controller has the StructARController script

---

## 📊 Summary

| What | Where |
|------|-------|
| Script | `Assets/Scripts/StartButton.ts` |
| Add to | Your button image in hierarchy |
| Assign | StructAR_Controller object |
| Adjust | Collider size if needed |

---

**That's it! Your button is now a start button.** 🎉
