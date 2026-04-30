/**
 * Test3DPanelVisibility.ts
 * 
 * Simple test script to verify 3D panel visibility.
 * Attach this to any object and it will test the panel on tap.
 */

@component
export class Test3DPanelVisibility extends BaseScriptComponent {
  
  @input model3DPanelObj: SceneObject;
  
  onAwake() {
    print("=== 3D Panel Visibility Test ===");
    
    if (!this.model3DPanelObj) {
      print("❌ model3DPanelObj not assigned!");
      return;
    }
    
    print("✅ model3DPanelObj assigned: " + this.model3DPanelObj.name);
    
    // Check if object is enabled
    print("  - Enabled: " + this.model3DPanelObj.enabled);
    
    // Check transform
    const transform = this.model3DPanelObj.getTransform();
    const pos = transform.getWorldPosition();
    const scale = transform.getWorldScale();
    print("  - Position: (" + pos.x + ", " + pos.y + ", " + pos.z + ")");
    print("  - Scale: (" + scale.x + ", " + scale.y + ", " + scale.z + ")");
    
    // Check for script component
    const scriptComponent = this.model3DPanelObj.getComponent("ScriptComponent");
    if (scriptComponent) {
      print("✅ Has ScriptComponent");
      
      // Try to call the public method
      const panel = scriptComponent as any;
      if (typeof panel.showLoadingFromController === "function") {
        print("✅ showLoadingFromController method exists");
      } else {
        print("❌ showLoadingFromController method NOT found");
      }
    } else {
      print("❌ No ScriptComponent found!");
    }
    
    // Set up tap test
    this.createEvent("TapEvent").bind(() => {
      this.testPanelVisibility();
    });
    
    print("=== Tap screen to test panel visibility ===");
  }
  
  private testPanelVisibility() {
    print("\n=== Testing Panel Visibility ===");
    
    if (!this.model3DPanelObj) {
      print("❌ No panel object to test");
      return;
    }
    
    const scriptComponent = this.model3DPanelObj.getComponent("ScriptComponent") as any;
    if (!scriptComponent) {
      print("❌ No script component");
      return;
    }
    
    // Test 1: Toggle panel enabled state
    print("Test 1: Toggling panel enabled state...");
    this.model3DPanelObj.enabled = !this.model3DPanelObj.enabled;
    print("  Panel enabled: " + this.model3DPanelObj.enabled);
    
    // Wait a moment then toggle back
    const delay1 = this.createEvent("DelayedCallbackEvent");
    delay1.bind(() => {
      this.model3DPanelObj.enabled = !this.model3DPanelObj.enabled;
      print("  Panel enabled: " + this.model3DPanelObj.enabled);
      
      // Test 2: Call showLoadingFromController
      const delay2 = this.createEvent("DelayedCallbackEvent");
      delay2.bind(() => {
        print("\nTest 2: Calling showLoadingFromController...");
        if (typeof scriptComponent.showLoadingFromController === "function") {
          scriptComponent.showLoadingFromController("Test Part");
          print("  Method called successfully");
        } else {
          print("  ❌ Method not available");
        }
      });
      delay2.reset(1.0);
    });
    delay1.reset(1.0);
  }
}
