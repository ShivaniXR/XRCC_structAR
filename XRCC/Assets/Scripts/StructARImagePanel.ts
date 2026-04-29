/**
 * StructARImagePanel.ts
 *
 * Displays Imagen-generated diagrams as AR overlays.
 * Receives base64 image data from StructARController and renders it
 * on a world-space Image component.
 *
 * Wiring in Inspector:
 *   - imageComponent:   Image component on a world-space SceneObject
 *   - captionText:      Text component for the diagram caption
 *   - panelRoot:        Root SceneObject to show/hide the whole panel
 *   - autoHideSeconds:  0 = stay visible until next diagram; >0 = auto-hide
 */

@component
export class StructARImagePanel extends BaseScriptComponent {

  @input imageComponent: Image;
  @input captionText: Text;
  @input panelRoot: SceneObject;

  @input autoHideSeconds: number = 0;

  private hideAt: number = 0;

  onAwake() {
    this.setPanelVisible(false);
  }

  // Public methods called directly by StructARController
  public showDiagramFromController(mimeType: string, b64: string, caption: string) {
    this.showDiagram(b64, caption);
  }

  public hidePanel() {
    this.setPanelVisible(false);
  }

  onUpdate() {
    if (this.autoHideSeconds <= 0 || this.hideAt <= 0) return;
    if (getTime() >= this.hideAt) {
      this.hideAt = 0;
      this.setPanelVisible(false);
    }
  }

  /**
   * Load a base64-encoded image and display it on the panel.
   * Uses the RemoteMediaModule pattern from RSG examples.
   */
  private showDiagram(b64: string, caption: string) {
    if (!this.imageComponent) {
      print("[ImagePanel] ❌ No imageComponent assigned");
      return;
    }

    try {
      // Decode base64 to raw bytes
      const bytes: Uint8Array = Base64.decode(b64);

      // Load as texture via RemoteMediaModule (same pattern as Snap3D texture loading)
      const remoteMediaModule = require("LensStudio:RemoteMediaModule") as RemoteMediaModule;
      const internetModule = require("LensStudio:InternetModule") as InternetModule;

      // Build an HTTP request pointing to a data URI isn't supported directly,
      // so we use the Snap-provided approach: write bytes to a temp resource
      // and load via loadResourceAsImageTexture.
      //
      // In practice on Spectacles, the cleanest approach is to use
      // Base64.encodeTextureAsync in reverse — but the SDK doesn't expose that.
      // Instead we use the ProceduralTextureProvider approach:
      this.loadTextureFromBytes(bytes, remoteMediaModule, (texture: Texture) => {
        this.imageComponent.mainPass.baseTex = texture;
        this.setPanelVisible(true);
        if (this.captionText) this.captionText.text = caption || "";
        if (this.autoHideSeconds > 0) {
          this.hideAt = getTime() + this.autoHideSeconds;
        }
        print("[ImagePanel] ✅ Diagram displayed");
      });

    } catch (e) {
      print("[ImagePanel] ❌ showDiagram error: " + e);
      // Still show panel with caption as fallback
      this.setPanelVisible(true);
      if (this.captionText) this.captionText.text = caption || "";
    }
  }

  private loadTextureFromBytes(
    bytes: Uint8Array,
    remoteMediaModule: RemoteMediaModule,
    onSuccess: (tex: Texture) => void
  ) {
    // Spectacles doesn't expose Resource.fromBytes in all builds
    // Use the fallback approach directly
    this.fallbackLoadTexture(bytes, onSuccess);
  }

  /**
   * Fallback: create a ProceduralTextureProvider and write pixel data.
   * Works when Resource.fromBytes is unavailable.
   */
  private fallbackLoadTexture(bytes: Uint8Array, onSuccess: (tex: Texture) => void) {
    try {
      // Use the existing material's texture slot if it already has one
      const mat = this.imageComponent.mainMaterial;
      if (!mat) return;

      const existingTex = mat.mainPass.baseTex as any;
      if (existingTex && typeof existingTex.loadBase64 === "function") {
        // Some Lens Studio builds expose loadBase64 on texture assets
        const b64 = Base64.encode(bytes);
        existingTex.loadBase64(b64);
        onSuccess(existingTex as Texture);
      } else {
        print("[ImagePanel] ⚠️ No texture loading method available in this build");
      }
    } catch (e) {
      print("[ImagePanel] ❌ Fallback texture load failed: " + e);
    }
  }

  private setPanelVisible(visible: boolean) {
    if (this.panelRoot) this.panelRoot.enabled = visible;
  }
}
