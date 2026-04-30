# Spectacles Object Detection - Final Solution

## 🎯 The Problem

The previous implementation didn't account for Spectacles-specific spatial positioning:
- ❌ Used generic screen-to-world conversion
- ❌ Didn't use World Query for real surface detection
- ❌ Ignored Spectacles' recommended Z-distances
- ❌ No depth data integration

## ✅ The Solution

New implementation uses **World Query Module** - Spectacles' official API for spatial positioning:
- ✅ Ray casting against real surfaces using depth data
- ✅ Proper Spectacles coordinate system
- ✅ Recommended Z-distances (35cm-160cm)
- ✅ Fallback to mid-field (110cm) when no surface hit

---

## 📚 Key Spectacles Concepts

### Z-Axis Positioning (from Snap docs)

**Recommended distances:**
- **35cm** - Near field, hand-anchored, quick controls (Width: 13cm)
- **55cm** - Arm's reach, near field controls (Width: 23cm)
- **110cm** - **Mid field, best default** (Width: 53cm) ← We use this
- **160cm** - Far field, ultra-large (Width: 75cm)

### World Query Module

**What it does:**
- Performs ray casting against real surfaces
- Uses depth map from Spectacles cameras
- Returns hit position and surface normal
- Optimized for wearable devices

**Performance note:**
- 5Hz update rate (slow)
- Works only for static/slow-moving objects
- Perfect for labeling stationary objects

---

## 🔧 Setup Instructions

### Step 1: Replace ObjectDetectionManager

1. **Delete old script:**
   ```
   Remove ObjectDetectionManager.ts (if you have it)
   ```

2. **Use new script:**
   ```
   SpectaclesObjectDetection.ts is already created
   ```

### Step 2: Update Scene Setup

1. **Select ObjectDetectionManager object**

2. **Remove old component, add new:**
   ```
   Remove: ObjectDetectionManager component
   Add: SpectaclesObjectDetection component
   ```

3. **Configure inputs:**
   ```
   labelPrefab: Your text label prefab
   highlightPrefab: Your sphere/indicator prefab
   camera: Drag Camera object
   maxLabels: 10
   labelOffsetY: 5 (cm above surface)
   highlightScale: 3 (cm diameter)
   labelScale: 2 (cm size)
   defaultDepth: 110 (cm - mid-field default)
   ```

### Step 3: Update StructARController

1. **Select StructARController**

2. **Verify wiring:**
   ```
   objectDetectionManagerObj: Still points to same object
   enableObjectDetection: Still checked
   ```

The script name changed but the object reference stays the same!

---

## 🎨 How It Works

### With World Query (Preferred)

```
1. Gemini provides screen coordinates (0-1)
2. Convert to ray (start 30cm from camera, end 300cm)
3. World Query hit tests ray against real surfaces
4. If hit: Place label at real surface position
5. If no hit: Use fallback (110cm default depth)
```

### Fallback Mode

```
If World Query unavailable:
1. Use screen coordinates
2. Project to 110cm depth (mid-field)
3. Place label at calculated position
```

### Ray Casting Details

**Ray start:** 30cm in front of camera (per World Query docs)
**Ray end:** 300cm away in direction of screen coordinate
**Hit result:** Real-world position + surface normal

---

## 📊 Position Calculation

### Screen to Ray Conversion

```typescript
// Camera at (0, 0, 0)
// Screen coords: (0.5, 0.5) = center
// Screen coords: (0.0, 0.0) = top-left
// Screen coords: (1.0, 1.0) = bottom-right

Ray start = camera position + forward * 30cm
Ray end = camera position + forward * 300cm
          + right * (screenX - 0.5) * viewWidth
          + up * (0.5 - screenY) * viewHeight
```

### Fallback Positioning

```typescript
// When no surface hit, use mid-field default
Position = camera position + forward * 110cm
           + right * (screenX - 0.5) * 53cm
           + up * (0.5 - screenY) * 77cm

// 53cm x 77cm = recommended display size at 110cm
```

---

## 🧪 Testing

### Test 1: Surface Detection
```
Place object on table
Ask: "Label the object on the table"
Expected: Label appears ON the table surface
```

### Test 2: Wall Detection
```
Point at wall
Ask: "Label the picture on the wall"
Expected: Label appears ON the wall
```

### Test 3: No Surface (Fallback)
```
Point at sky/empty space
Ask: "Label something"
Expected: Label appears at 110cm depth
```

### Test 4: Multiple Objects
```
Multiple objects at different depths
Ask: "Label all the parts"
Expected: Labels at correct depths for each object
```

---

## 🐛 Troubleshooting

### Labels Still in Wrong Position

**Check console for:**
```
[SpectaclesDetection] ✅ World Query session created
[SpectaclesDetection] ✅ Hit real surface at: (x, y, z)
```

**If you see:**
```
[SpectaclesDetection] ⚠️ Could not create World Query session
```
Then World Query isn't available - using fallback mode.

### Labels Too Close/Far

**Adjust:**
```
defaultDepth: 110 (try 80-150)
```

**For specific use cases:**
- Near-field UI: 35-55cm
- Mid-field content: 110cm (default)
- Far-field large content: 160cm

### Labels Not Facing Camera

The script automatically makes labels face camera in onUpdate.
If not working, check that camera is assigned.

### Highlights Not Oriented to Surface

Highlights are oriented using surface normal from World Query.
If surface is flat (like table), highlight will be flat on it.

---

## 📋 Console Logs

### Successful Detection with Surface Hit
```
[SpectaclesDetection] Detecting: Screw at screen (0.3, 0.5)
[SpectaclesDetection] ✅ Hit real surface at: (25.3, -10.2, -110.5)
[SpectaclesDetection] ✅ Created label: Screw
```

### Detection with Fallback
```
[SpectaclesDetection] Detecting: Button at screen (0.7, 0.3)
[SpectaclesDetection] No surface hit, using default depth
[SpectaclesDetection] ✅ Created label: Button
```

---

## 🎯 Key Improvements

### Compared to Previous Version

| Feature | Old | New |
|---------|-----|-----|
| **Positioning** | Generic screen-to-world | World Query ray casting |
| **Depth** | Fixed arbitrary distance | Real surface depth or 110cm default |
| **Accuracy** | Poor | Accurate to real surfaces |
| **Spectacles-specific** | No | Yes - uses official APIs |
| **Surface detection** | None | Full depth map integration |
| **Fallback** | Random | Spectacles mid-field (110cm) |

---

## 📖 References

Based on official Snap documentation:
- [World Query Module](https://docs.snap.com/spectacles/about-spectacles-features/apis/world-query)
- [Positioning & Sizing Content](https://docs.snap.com/spectacles/best-practices/design-for-spectacles/positioning-sizing-content)

**Key takeaways:**
- Use World Query for spatial positioning
- Default to 110cm (mid-field) when no surface
- Ray start at 30cm from camera (per docs)
- Respect Spectacles' coordinate system

---

## ✅ Summary

**What changed:**
1. ✅ New script: `SpectaclesObjectDetection.ts`
2. ✅ Uses World Query Module for real surface detection
3. ✅ Proper ray casting with 30cm start offset
4. ✅ Fallback to 110cm (Spectacles mid-field recommendation)
5. ✅ Surface normal orientation for highlights
6. ✅ Labels auto-face camera

**Setup:**
1. Replace component on ObjectDetectionManager object
2. Assign camera input
3. Test with real objects

**This should now place labels accurately on real surfaces!** 🎯
