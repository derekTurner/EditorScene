import { AnimationGroup, Quaternion, Scene, Vector3 } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { IScript } from "babylonjs-editor-tools";

// Farmer baked animations not associated with character controller movement
export default class SceneComponent implements IScript {
  private deathAnim: AnimationGroup | null;
  private gun_ShootAnim: AnimationGroup | null;
  private hitRecieveAnim: AnimationGroup | null;
  private hitRecieve_2Anim: AnimationGroup | null;
  private idleAnim: AnimationGroup | null;
  private idle_GunAnim: AnimationGroup | null;
  private idle_Gun_PointingAnim: AnimationGroup | null;
  private idle_Gun_ShootAnim: AnimationGroup | null;
  private idle_NeutralAnim: AnimationGroup | null;
  private idle_SwordAnim: AnimationGroup | null;
  private interactAnim: AnimationGroup | null;
  private kick_LeftAnim: AnimationGroup | null;
  private kick_RightAnim: AnimationGroup | null;
  private punch_LeftAnim: AnimationGroup | null;
  private punch_RightAnim: AnimationGroup | null;
  private rollAnim: AnimationGroup | null;
  private runAnim: AnimationGroup | null;
  private run_backAnim: AnimationGroup | null;
  private run_LeftAnim: AnimationGroup | null;
  private run_RightAnim: AnimationGroup | null;
  private run_ShootAnim: AnimationGroup | null;
  private sword_slashAnim: AnimationGroup | null;
  private walkAnim: AnimationGroup | null;
  private waveAnim: AnimationGroup | null;

  private animating: boolean = false;
  private keyDownMap: { [key: string]: boolean } | null = null;

  public constructor(public mesh: Mesh) {
    //model animation groups
    this.deathAnim = this.mesh.getScene().getAnimationGroupByName("Death"); //x
    this.gun_ShootAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Gun_Shoot"); //T
    this.hitRecieveAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("HitRecieve"); //Y
    this.hitRecieve_2Anim = this.mesh
      .getScene()
      .getAnimationGroupByName("HitRecieve_2"); //U
    this.idleAnim = this.mesh.getScene().getAnimationGroupByName("Idle"); //I
    this.idle_GunAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Idle_Gun"); //O
    this.idle_Gun_PointingAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Idle_Gun_Pointing"); //R
    this.idle_Gun_ShootAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Idle_Gun_Shoot"); //F
    this.idle_NeutralAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Idle_Neutral"); //G
    this.idle_SwordAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Idle_Sword"); //H
    this.interactAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Interact"); //I
    this.kick_LeftAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Kick_Left"); //v
    this.kick_RightAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Kick_Right"); //V
    this.punch_LeftAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Punch_Left"); //p
    this.punch_RightAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Punch_Right"); //P
    this.rollAnim = this.mesh.getScene().getAnimationGroupByName("Roll"); //J
    this.runAnim = this.mesh.getScene().getAnimationGroupByName("Run"); //
    this.run_backAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Run_back"); //
    this.run_LeftAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Run_Left"); //
    this.run_RightAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Run_Right"); //
    this.sword_slashAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Sword_slash"); //
    this.run_ShootAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Run_Shoot"); //
    this.walkAnim = this.mesh.getScene().getAnimationGroupByName("Walk"); //
    this.waveAnim = this.mesh.getScene().getAnimationGroupByName("Wave"); //
  }
  public onStart(): void {
    this.deathAnim!.stop();
    this.idleAnim!.start(true);
  }

  public onUpdate(): void {
    this.keyDownMap = this.mesh.getScene().getExternalData("keyDownMap");

    //https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/center_origin/rotation_quaternions
    var keydown = false;

    //trigger non- looping animations from keyboard for testing
    //https://doc.babylonjs.com/typedoc/classes/BABYLON.AnimationGroup#start

    if (this.keyDownMap!["x"] || this.keyDownMap!["X"]) {
      this.idleAnim!.stop();
      this.walkAnim!.stop();
      this.deathAnim!.start(
        false,
        1.0,
        this.deathAnim!.from,
        this.deathAnim!.to,
        false
      );
      this.deathAnim!.goToFrame(this.deathAnim!.to); // don't get up!
    }

    if (
      (this.keyDownMap!["t"] || this.keyDownMap!["T"]) &&
      !this.gun_ShootAnim!.isPlaying
    ) {
      this.idleAnim!.stop();
      this.walkAnim!.stop();
      this.gun_ShootAnim!.start(
        false,
        1.0,
        this.gun_ShootAnim!.from,
        this.gun_ShootAnim!.to,
        false
      );
      this.gun_ShootAnim!.start(true);
      this.gun_ShootAnim!.goToFrame(this.gun_ShootAnim!.to); // don't fire twice
    }

    /*  Other animations
    if (this.keyDownMap!["y"] || this.keyDownMap!["Y"]) {
      this.hitRecieveAnim!.start(true);
    }
    if (this.keyDownMap!["o"] || this.keyDownMap!["O"]) {
      this.idle_GunAnim!.start(true);
    }
    if (this.keyDownMap!["r"] || this.keyDownMap!["R"]) {
      this.idle_Gun_PointingAnim!.start(true);
    }
   */
  }
}
