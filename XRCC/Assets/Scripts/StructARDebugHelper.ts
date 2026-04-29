/**
 * StructARDebugHelper.ts
 * 
 * Attach this to your StructAR object to verify wiring.
 * Check the console on play to see what's connected.
 */

@component
export class StructARDebugHelper extends BaseScriptComponent {
  
  @input structARController: ScriptComponent;
  
  onAwake() {
    print("=== StructAR Debug Helper ===");
    
    if (!this.structARController) {
      print("❌ StructARController not assigned");
      return;
    }
    
    const ctrl = this.structARController as any;
    
    print("Checking inputs...");
    print("  websocketRequirementsObj: " + (ctrl.websocketRequirementsObj ? "✅" : "❌"));
    print("  dynamicAudioOutputObj: " + (ctrl.dynamicAudioOutputObj ? "✅" : "❌"));
    print("  microphoneRecorderObj: " + (ctrl.microphoneRecorderObj ? "✅" : "❌"));
    print("  transcriptDisplay: " + (ctrl.transcriptDisplay ? "✅" : "❌"));
    print("  statusDisplay: " + (ctrl.statusDisplay ? "✅" : "❌"));
    print("  imagenPanelObj: " + (ctrl.imagenPanelObj ? "✅" : "❌"));
    print("  model3DPanelObj: " + (ctrl.model3DPanelObj ? "✅" : "❌"));
    print("  haveVideoInput: " + ctrl.haveVideoInput);
    print("  voice: " + ctrl.voice);
    
    // Check if text components are enabled
    if (ctrl.transcriptDisplay) {
      const tso = ctrl.transcriptDisplay.getSceneObject();
      print("  transcriptDisplay SceneObject enabled: " + (tso ? tso.enabled : "N/A"));
    }
    
    if (ctrl.statusDisplay) {
      const sso = ctrl.statusDisplay.getSceneObject();
      print("  statusDisplay SceneObject enabled: " + (sso ? sso.enabled : "N/A"));
    }
    
    print("=== End Debug ===");
  }
}
