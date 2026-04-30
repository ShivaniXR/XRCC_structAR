# Test Snap3D with Known Safe Prompts

## 🎯 Key Discovery from ExampleSnap3D

**ExampleSnap3D default prompt:** `"A cute dog wearing a hat"`

This is a **proven safe prompt** that passes ALD verification. Let's test our system with similar safe prompts.

---

## 🧪 Test Strategy

### 1. Test with ExampleSnap3D's Exact Prompt

Try asking Gemini to generate:
- "A cute dog wearing a hat"

This should work since it's the exact prompt from the working example.

### 2. Test with Similar Safe Animal Prompts

- "A small cat sitting down"
- "A friendly rabbit with floppy ears"
- "A cartoon bear with a bow tie"
- "A tiny bird on a branch"

### 3. Test with Simple Geometric Objects

- "A wooden cube, brown color"
- "A metal sphere, silver finish"
- "A plastic cylinder, white color"
- "A rubber ring, black color"

### 4. Test with Basic Furniture Parts

- "A wooden dowel, cylindrical rod"
- "A metal bracket, L-shaped"
- "A plastic connector, rectangular"
- "A rubber washer, circular"

---

## 🔍 Configuration Comparison

### ExampleSnap3D Configuration
```typescript
Snap3D.submitAndGetStatus({
  prompt: this.prompt,           // "A cute dog wearing a hat"
  format: "glb",
  refine: this.refineMesh,       // true
  use_vertex_color: this.useVertexColor,  // false
})
```

### Our Configuration
```typescript
Snap3D.submitAndGetStatus({
  prompt: saferPrompt,           // Our sanitized prompt
  format: "glb", 
  refine: true,
  use_vertex_color: false,
})
```

**Configuration is identical!** The issue is purely prompt content.

---

## 🎯 Debugging Steps

### Step 1: Test ExampleSnap3D Directly

1. In Lens Studio, find the ExampleSnap3D object
2. Enable it temporarily
3. Set `runOnTap` to true in inspector
4. Tap to test with "A cute dog wearing a hat"
5. Verify it works

### Step 2: Test Our System with Safe Prompt

Ask Gemini: "Can you show me a cute dog wearing a hat in 3D?"

**Expected result:** Should work since it matches the proven safe prompt.

### Step 3: Test Progressive Complexity

1. Start with animals (known safe)
2. Move to simple objects
3. Gradually test more complex items

---

## 🔧 Quick Fix: Add Fallback to Safe Prompts

If we keep getting ALD failures, we can add a fallback system:

```typescript
private getFallbackPrompt(originalPrompt: string): string {
  // If original prompt fails, try these known-safe alternatives
  const safeFallbacks = [
    "wooden cube, brown color, simple shape",
    "metal sphere, silver finish, smooth surface", 
    "plastic cylinder, white color, basic form",
    "rubber ring, black color, circular shape"
  ];
  
  // Pick a random safe fallback
  return safeFallbacks[Math.floor(Math.random() * safeFallbacks.length)];
}
```

---

## 📊 Expected Results

### If ExampleSnap3D Works But Ours Doesn't

**Problem:** Our prompt sanitization isn't enough
**Solution:** Use more conservative prompts, add more fallbacks

### If Both Fail

**Problem:** Snap3D service issue or account restrictions
**Solution:** Check Snap3D service status, verify API access

### If Both Work

**Problem:** Specific prompts Gemini is generating
**Solution:** Our current fixes should resolve it

---

## 🎯 Action Plan

1. **Test ExampleSnap3D first** - Verify the service works
2. **Test with "cute dog"** - Use proven safe prompt
3. **Check console logs** - See exact prompts being sent
4. **Iterate on prompt safety** - Add more conservative alternatives

---

## 💡 Key Insights

### Why "A cute dog wearing a hat" Works

- ✅ **Whimsical/cartoon-like** - Not realistic/threatening
- ✅ **Animal subject** - Generally safe category  
- ✅ **Clothing accessory** - Harmless addition
- ✅ **Simple description** - No complex mechanisms
- ✅ **Positive tone** - "cute", "wearing" are safe words

### Why Tool Prompts Fail

- ❌ **Functional objects** - Could be used as weapons
- ❌ **Sharp/pointed** - Safety concern
- ❌ **Metal tools** - Weapon association
- ❌ **Action words** - "cutting", "drilling", etc.

---

## 🚀 Next Steps

1. Test ExampleSnap3D to verify service works
2. Try "cute dog" prompt through our system
3. If that works, gradually test safer object prompts
4. If issues persist, implement conservative fallback system

**The key is starting with prompts we KNOW work, then building up complexity gradually.** 🎯