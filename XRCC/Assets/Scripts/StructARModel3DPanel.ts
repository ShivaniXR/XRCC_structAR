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
  @input loadingIndicator: SceneObject;
  @input partNameText: Text;
  @input panelRoot: SceneObject;

  @input rotationDegreesPerSecond: number = 30.0;

  private currentModel: SceneObject | null = null;
  private isRotating: boolean = false;

  onAwake() {
    this.setPanelVisible(false);
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
    // Clear any existing model
    this.clearCurrentModel();

    // Show panel with loading state
    this.setPanelVisible(true);
    if (this.loadingIndicator) this.loadingIndicator.enabled = true;
    if (this.partNameText) {
      this.partNameText.text = "Generating: " + partName + "\n(~60 seconds)";
    }
    this.isRotating = false;
    print("[3DPanel] Showing loading state for: " + partName);
  }

  private showModel(gltfAsset: GltfAsset, partName: string) {
    if (!this.modelRoot) {
      print("[3DPanel] ❌ No modelRoot assigned");
      return;
    }

    // Clear previous model
    this.clearCurrentModel();

    try {
      this.currentModel = gltfAsset.tryInstantiate(
        this.modelRoot,
        this.modelMaterial
      );

      if (this.loadingIndicator) this.loadingIndicator.enabled = false;
      if (this.partNameText) this.partNameText.text = partName;

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
    if (this.panelRoot) this.panelRoot.enabled = visible;
  }
}
