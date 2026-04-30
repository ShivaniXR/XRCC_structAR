# Start Button - Quick Guide

## ⚡ 3 Steps to Make Your Button Work

### 1️⃣ Select Button Image
```
Click your button image in hierarchy
```

### 2️⃣ Add StartButton Script
```
Add Component → Search "StartButton" → Add
```

### 3️⃣ Assign Controller
```
In Inspector:
Struct AR Controller → Drag StructAR_Controller here
```

---

## ✅ Done!

Your button will now:
- ✅ Be tappable with hand tracking
- ✅ Start StructAR when tapped
- ✅ Enable Gemini Live

---

## 🎯 Visual Setup

```
Hierarchy:
└── ButtonImage (your button)
    └── Components:
        ├── Image
        ├── StartButton ← Add this!
        ├── Interactable (auto-added)
        └── Collider (auto-added)

Inspector (StartButton):
├── Struct AR Controller: [StructAR_Controller] ← Assign this!
└── Collider Size: {10, 5, 1} ← Adjust if needed
```

---

## 🔧 Adjust Collider Size?

If button doesn't respond well:
```
Collider Size: {x: 10, y: 5, z: 1}
              ↑    ↑    ↑
           width height depth

Match your button image size!
```

---

## 📝 That's It!

**Full Guide:** See `START_BUTTON_SETUP.md`

---

**Tap your button to start!** 🚀
