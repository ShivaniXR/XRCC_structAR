/**
 * StructARModel3DPanel.ts
 *
 * Manages the floating 3D model display for Snap3D-generated parts.
 * Shows a loading spinner while generation is in progress,
 * then instantiates the GLTF model when ready.
 *
 * Wiring in Inspector:
 *   - modelRoot:        SceneObject to parent the instantiated GLTF under
 *   - modelMaterial:    Material to apply to the GLTF mesh
 *   - loadingIndicator: SceneObject (spinner/loading UI) shown during generation
 *   - partNameText:     Text component showing the part name
 *   - panelRoot:        Root SceneObject to show/hide the whole panel
 *
 * The panel auto-rotates the model slowly so the user can see it from all sides.
 */

import { Snap3DTypes } from "RemoteServiceGateway.lspkg/HostedSnap/Snap3DTypes";

@component
export class StructARModel3DPanel extends BaseScriptComponent {

  @input modelRoot: SceneObject;
  @input modelMaterial: Material;
  @input partNameText: Text;
  @input panelRoot: SceneObject;

  @input rotationDegreesPerSecond: number = 30.0;

  private currentModel: SceneObject | null = null;
  private isRotating: boolean = false;
  private loadingSpinner: SceneObject | null = null;

  onAwake() {
    // Initialize spinner from modelRoot's child (like ExampleSnap3D does)
    this.initializeSpinner();
    
    // Start with panel hidden
    this.setPanelVisible(false);
    
    // Validate rotation speed
    if (this.rotationDegreesPerSecond < 0 || this.rotationDegreesPerSecond > 360) {
      print("[3DPanel] ⚠️ rotationDegreesPerSecond out of range [0-360], clamping to safe value");
      this.rotationDegreesPerSecond = Math.max(0, Math.min(360, this.rotationDegreesPerSecond));
    }
    
    // Verify inputs
    if (!this.panelRoot) {
      print("[3DPanel] ⚠️ panelRoot not assigned - panel will not be visible!");
    }
    if (!this.modelRoot) {
      print("[3DPanel] ⚠️ modelRoot not assigned - models cannot be instantiated!");
    }
    
    print("[3DPanel] Initialized");
  }

  private initializeSpinner() {
    // Like ExampleSnap3D: spinner is child[1] of modelRoot
    if (this.modelRoot && this.modelRoot.getChildrenCount() > 1) {
      this.loadingSpinner = this.modelRoot.getChild(1);
      print("[3DPanel] Found loading spinner at modelRoot.getChild(1)");
    } else {
      print("[3DPanel] ⚠️ No spinner found - add a child object at index 1 under modelRoot");
    }
    
    // Start with spinner disabled
    if (this.loadingSpinner) {
      this.loadingSpinner.enabled = false;
    }
  }

  // Public methods called directly by StructARController
  public showLoadingFromController(partName: string) {
    this.showLoading(partName);
  }

  public showModelFromController(gltfAsset: GltfAsset, partName: string) {
    this.showModel(gltfAsset, partName);
  }

  public hidePanel() {
    this.setPanelVisible(false);
  }

  onUpdate() {
    if (!this.isRotating || !this.currentModel) return;

    // Slowly rotate the model around Y axis so user can see all sides
    const dt = getDeltaTime();
    const transform = this.currentModel.getTransform();
    const currentRot = transform.getLocalRotation();
    const deltaRot = quat.fromEulerAngles(
      0,
      (this.rotationDegreesPerSecond * dt * Math.PI) / 180.0,
      0
    );
    transform.setLocalRotation(currentRot.multiply(deltaRot));
  }

  private showLoading(partName: string) {
    print("[3DPanel] showLoading called for: " + partName);
    
    // Clear any existing model
    this.clearCurrentModel();

    // Show panel with loading state
    print("[3DPanel] Setting panel visible...");
    this.setPanelVisible(true);
    
    if (this.loadingSpinner) {
      this.loadingSpinner.enabled = true;
      print("[3DPanel] Loading spinner enabled");
    } else {
      print("[3DPanel] ⚠️ No loading spinner to show");
    }
    
    if (this.partNameText) {
      this.partNameText.text = "Generating: " + partName + "\n(~60 seconds)";
    }
    
    this.isRotating = false;
    print("[3DPanel] ✅ Loading state visible");
  }

  private showModel(gltfAsset: GltfAsset, partName: string) {
    if (!this.modelRoot) {
      print("[3DPanel] ❌ No modelRoot assigned");
      return;
    }

    // Clear previous model
    this.clearCurrentModel();

    try {
      // Instantiate at child[0] (spinner is at child[1])
      this.currentModel = gltfAsset.tryInstantiate(
        this.modelRoot,
        this.modelMaterial
      );

      // Hide spinner
      if (this.loadingSpinner) {
        this.loadingSpinner.enabled = false;
      }
      
      if (this.partNameText) {
        this.partNameText.text = partName;
      }

      this.setPanelVisible(true);
      this.isRotating = true;

      print("[3DPanel] ✅ Model instantiated: " + partName);
    } catch (e) {
      print("[3DPanel] ❌ Model instantiation failed: " + e);
      if (this.partNameText) {
        this.partNameText.text = "3D load failed: " + partName;
      }
    }
  }

  private clearCurrentModel() {
    this.isRotating = false;
    if (!isNull(this.currentModel)) {
      this.currentModel!.destroy();
      this.currentModel = null;
    }
  }

  private setPanelVisible(visible: boolean) {
    if (this.panelRoot) {
      this.panelRoot.enabled = visible;
      print("[3DPanel] Panel visibility set to: " + visible);
    } else {
      print("[3DPanel] ❌ Cannot set visibility - panelRoot is null!");
    }
  }
}
