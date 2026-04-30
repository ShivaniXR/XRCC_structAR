/**
 * StartButton.ts
 * 
 * Makes a button image start the StructAR lens when pinched/tapped via hand tracking.
 * Uses SIK Interactable directly — add this script to your button image SceneObject.
 * 
 * Setup in Inspector:
 *   1. Add this script to your button image SceneObject
 *   2. Assign structARController (the object with StructARController script)
 *   3. Assign startImage (the display image to hide when button is tapped)
 *   4. Make sure your button image has a ColliderComponent (add one manually in Inspector)
 *      - Add Component → Physics Collider → set shape to Box, match your image size
 *   5. Make sure SIK is present in your scene (InteractionManager prefab)
 */

import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class StartButton extends BaseScriptComponent {

  @input
  @hint("The SceneObject that has the StructARController script on it")
  structARController: SceneObject;

  @input
  @hint("The start screen display image to hide when button is tapped")
  startImage: SceneObject;

  @input
  @hint("Hide this button image after it is tapped")
  hideOnTap: boolean = true;

  private hasStarted: boolean = false;
  private interactable: Interactable = null;

  onAwake() {
    print("[StartButton] Initializing...");

    if (!this.structARController) {
      print("[StartButton] ❌ structARController not assigned in Inspector!");
      return;
    }

    // Defer setup to OnStartEvent so SIK is fully initialized
    this.createEvent("OnStartEvent").bind(() => {
      this.setup();
    });
  }

  private setup() {
    // Get existing Interactable or create one
    this.interactable = this.sceneObject.getComponent(
      Interactable.getTypeName()
    ) as Interactable;

    if (!this.interactable) {
      this.interactable = this.sceneObject.createComponent(
        Interactable.getTypeName()
      ) as Interactable;
      print("[StartButton] ✅ Created Interactable on button");
    } else {
      print("[StartButton] ✅ Found existing Interactable on button");
    }

    // Allow all interaction modes: direct pinch, indirect ray, poke
    this.interactable.targetingMode = 7;

    // Fire when user releases pinch (standard button behaviour)
    this.interactable.onTriggerEnd.add(() => {
      this.onTapped();
    });

    print("[StartButton] ✅ Ready — pinch the button to start!");
  }

  private onTapped() {
    if (this.hasStarted) return;
    this.hasStarted = true;

    print("[StartButton] 🚀 Button tapped! Starting StructAR...");

    // Hide the button image
    if (this.hideOnTap) {
      this.sceneObject.enabled = false;
    }

    // Hide the start screen display image
    if (this.startImage) {
      this.startImage.enabled = false;
      print("[StartButton] ✅ Start image hidden");
    }

    // Call startLens() directly on the controller script — 
    // this avoids the disabled SceneObject / OnEnableEvent timing issue
    const controllerScript = this.structARController.getComponent("ScriptComponent") as any;
    if (controllerScript && typeof controllerScript.startLens === "function") {
      controllerScript.startLens();
      print("[StartButton] ✅ startLens() called on controller");
    } else {
      print("[StartButton] ❌ Could not find startLens() on controller script!");
    }
  }
}
