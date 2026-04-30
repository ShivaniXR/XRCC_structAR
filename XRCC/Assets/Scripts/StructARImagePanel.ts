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
  @input debugLogging: boolean = false;

  private hideAt: number = 0;
  private loadingSpinner: SceneObject | null = null;

  onAwake() {
    // Initialize spinner from imageComponent's SceneObject child (like ExampleSnap3D)
    this.initializeSpinner();
    
    this.setPanelVisible(false);
    
    // Validate inputs
    if (this.autoHideSeconds < 0) {
      print("[ImagePanel] ⚠️ autoHideSeconds cannot be negative, setting to 0");
      this.autoHideSeconds = 0;
    }
    
    // Ensure the Image component has a valid material
    if (this.imageComponent && !this.imageComponent.mainMaterial) {
      print("[ImagePanel] ⚠️ Image component has no material assigned!");
    }
    
    print("[ImagePanel] Initialized");
  }

  private initializeSpinner() {
    // Like ExampleSnap3D: spinner is child[1] of the image's SceneObject
    if (this.imageComponent) {
      const imageSceneObject = this.imageComponent.getSceneObject();
      if (imageSceneObject && imageSceneObject.getChildrenCount() > 1) {
        this.loadingSpinner = imageSceneObject.getChild(1);
        print("[ImagePanel] Found loading spinner at imageComponent.sceneObject.getChild(1)");
      } else {
        print("[ImagePanel] ⚠️ No spinner found - add a child object at index 1 under image SceneObject");
      }
    }
    
    // Start with spinner disabled
    if (this.loadingSpinner) {
      this.loadingSpinner.enabled = false;
    }
  }

  // Public methods called directly by StructARController
  public showDiagramFromController(mimeType: string, b64: string, caption: string) {
    this.showDiagram(b64, caption);
  }

  public showLoadingFromController(caption: string) {
    this.showLoading(caption);
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
   * Show loading state with spinner
   */
  private showLoading(caption: string) {
    this.setPanelVisible(true);
    
    // Hide the image, show spinner
    if (this.imageComponent) {
      this.imageComponent.enabled = false;
    }
    if (this.loadingSpinner) {
      this.loadingSpinner.enabled = true;
      print("[ImagePanel] Loading spinner enabled");
    }
    if (this.captionText) {
      this.captionText.text = "Generating: " + caption;
    }
    
    print("[ImagePanel] Showing loading state");
  }

  /**
   * Load a base64-encoded image and display it on the panel.
   * Uses the same method as RSG ExampleImagenCalls.
   */
  private showDiagram(b64: string, caption: string) {
    if (!this.imageComponent) {
      print("[ImagePanel] ❌ No imageComponent assigned");
      return;
    }

    try {
      // Use the same method as ExampleImagenCalls - Base64.decodeTextureAsync
      Base64.decodeTextureAsync(
        b64,
        (texture: Texture) => {
          if (this.debugLogging) {
            print("[ImagePanel] 🔍 Texture decoded - width: " + texture.getWidth() + ", height: " + texture.getHeight());
          }
          
          // Clone the existing material
          const imageMaterial = this.imageComponent.mainMaterial.clone();
          if (this.debugLogging) {
            print("[ImagePanel] Cloning existing material: " + imageMaterial.name);
          }
          
          this.imageComponent.mainMaterial = imageMaterial;
          this.imageComponent.mainPass.baseTex = texture;
          
          if (this.debugLogging) {
            print("[ImagePanel] 🔍 Pass: " + this.imageComponent.mainPass.name);
            print("[ImagePanel] 🔍 baseTex set: " + (this.imageComponent.mainPass.baseTex !== null));
          }
          
          // Hide spinner, show image
          if (this.loadingSpinner) {
            this.loadingSpinner.enabled = false;
          }
          this.imageComponent.enabled = true;
          
          this.setPanelVisible(true);
          if (this.captionText) this.captionText.text = caption || "";
          if (this.autoHideSeconds > 0) {
            this.hideAt = getTime() + this.autoHideSeconds;
          }
          
          print("[ImagePanel] ✅ Diagram displayed");
        },
        () => {
          print("[ImagePanel] ❌ Failed to decode texture from base64 data");
          // Hide spinner, still show panel with caption as fallback
          if (this.loadingSpinner) {
            this.loadingSpinner.enabled = false;
          }
          this.setPanelVisible(true);
          if (this.captionText) this.captionText.text = caption || "";
        }
      );

    } catch (e) {
      print("[ImagePanel] ❌ showDiagram error: " + e);
      // Hide spinner, still show panel with caption as fallback
      if (this.loadingSpinner) {
        this.loadingSpinner.enabled = false;
      }
      this.setPanelVisible(true);
      if (this.captionText) this.captionText.text = caption || "";
    }
  }

  private setPanelVisible(visible: boolean) {
    if (this.panelRoot) this.panelRoot.enabled = visible;
  }
}
