import {
  Scene,
} from "@babylonjs/core";

import { IScript } from "babylonjs-editor-tools";
import {
  PhysicsCharacterController,
  Vector3,
} from "@babylonjs/core";

// https://playground.babylonjs.com/#WO0H1U#13
// Create a character controller associated with farmer available externally as farmerController

export default class SceneComponent implements IScript {
  public farmerController: any;
  public farmerPosition = new Vector3(0, 0, 0);
  private h = 1.8;
  private r = 0.6;

  public constructor(public scene: Scene) {}

  public onStart(): void {
    console.log(this.scene.getMeshByName("Farmer"));
    this.farmerPosition = new Vector3(0, 0, 0);
    this.farmerController = new PhysicsCharacterController(
      this.farmerPosition,
      { capsuleHeight: this.h, capsuleRadius: this.r },
      this.scene
    );
    this.scene
      .getMeshByName("Farmer")
      ?.setPositionWithLocalVector(this.farmerController.getPosition());
    this.scene.addExternalData("farmerController", this.farmerController);
  }

  public onUpdate(): void {}
}
