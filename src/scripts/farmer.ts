import {
  AnimationGroup,
  Quaternion,
  Scene,
  Vector3,
  ActionManager,
  ExecuteCodeAction,
  Nullable,
  TransformNode,
  PhysicsAggregate,
  PhysicsShapeType,
  FreeCamera,
} from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { IScript } from "babylonjs-editor-tools";


export default class SceneComponent implements IScript {
  private scene!: Scene;
  //stash for messages to other scripts via externalData
  public stash: { [key: string]: string } = { message: "Empty Stash" };
  public keyDownMap: { [key: string]: boolean } = {};

  private camera!: FreeCamera;
 //Camera
 private cameraMaxDistance = 900;
 private cameraMinDistance = 600;
 private cameraMotionRate = 0.04;
 private cameraOffsetY = 500; // hold camera above target


  private ratio: number;
  private stepf: Vector3 = new Vector3(0, 0, 9); // +z
  private stepb: Vector3 = new Vector3(0, 0, -9); // -z
  private stepr: Vector3 = new Vector3(9, 0, 0); // +x
  private stepl: Vector3 = new Vector3(-9, 0, 0); // -x

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

  //physics aggregates
  private root = new TransformNode("root", this.scene);
  private player: Nullable<TransformNode> = null;
  private playerAggregate: Nullable<PhysicsAggregate> = null;

  private forward: Quaternion = Quaternion.RotationAxis(
    new Vector3(0, 1, 0),
    (0 * Math.PI) / 2
  );
  private backward: Quaternion = Quaternion.RotationAxis(
    new Vector3(0, 1, 0),
    (2 * Math.PI) / 2
  );
  private left: Quaternion = Quaternion.RotationAxis(
    new Vector3(0, 1, 0),
    (3 * Math.PI) / 2
  );
  private right: Quaternion = Quaternion.RotationAxis(
    new Vector3(0, 1, 0),
    (1 * Math.PI) / 2
  );

  public constructor(public mesh: Mesh) {
    this.scene = this.mesh.getScene();
    // align a transform node to the mesh
    this.root = new TransformNode("root", this.scene);
    this.root.position = this.mesh.position.clone();
    this.mesh.position = Vector3.Zero();
    this.mesh.parent = this.root;

    this.playerAggregate = new PhysicsAggregate(
      this.root,
      PhysicsShapeType.CAPSULE,
      { mass: 0, restitution: 0.3, friction: 1 },
      this.scene
    );
    this.playerAggregate.body.setCollisionCallbackEnabled(true);
    this.player! = this.playerAggregate.transformNode;

    this.camera = this.scene.activeCamera as FreeCamera; 

    this.ratio = this.scene.getAnimationRatio();
    this.stepr = this.stepr.scale(this.ratio);
    this.stepl = this.stepl.scale(this.ratio);
    this.stepf = this.stepf.scale(this.ratio);
    this.stepb = this.stepb.scale(this.ratio);

    this.stash.x = "-";
    this.stash.z = "-";

    //model animation groups
    this.deathAnim = this.scene.getAnimationGroupByName("Death"); //x
    this.gun_ShootAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("Gun_Shoot"); //T
    this.hitRecieveAnim = this.mesh
      .getScene()
      .getAnimationGroupByName("HitRecieve"); //Y
    this.hitRecieve_2Anim = this.mesh
      .getScene()
      .getAnimationGroupByName("HitRecieve_2"); //U
    this.idleAnim = this.scene.getAnimationGroupByName("Idle"); //I
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
    this.rollAnim = this.scene.getAnimationGroupByName("Roll"); //J
    this.runAnim = this.scene.getAnimationGroupByName("Run"); //
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
    this.walkAnim = this.scene.getAnimationGroupByName("Walk"); //wasd
    this.waveAnim = this.scene.getAnimationGroupByName("Wave"); //
  }

  public onStart(): void {
    this.deathAnim!.stop();
    this.idleAnim!.start(true);

    

    this.scene.actionManager = new ActionManager(this.scene);
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyDownTrigger,
        },
        (evt) => {
          this.keyDownMap[evt.sourceEvent.key] = true;
          //console.log("key down");
          //console.log(this.keyDownMap);
        }
      )
    );
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyUpTrigger,
        },
        (evt) => {
          this.keyDownMap[evt.sourceEvent.key] = false;
          console.log("key up");
          console.log(this.keyDownMap);
        }
      )
    );

//before rendereable
this.scene.onBeforeRenderObservable.add(() => {

     // camera following
      // https://doc.babylonjs.com/typedoc/classes/BABYLON.FreeCamera
      // camera direction is the direction the camera is moving towards
      //
      var cameraDirection = this.camera.getDirection(new Vector3(0, 0, 1));
      cameraDirection.y = 0;
      cameraDirection.normalize();
      // https://doc.babylonjs.com/typedoc/classes/BABYLON.Vector3#lerp
      this.camera.setTarget(
        Vector3.Lerp(this.camera.getTarget(), this.player!.position.clone(), 0.1) // moves the target towards the mesh position
      );
      var dist = Vector3.Distance(this.camera.position, this.player!.position.clone()); // distance between camera and target
      const amount =
        (Math.min(dist - this.cameraMinDistance, 0) +
          Math.max(dist - this.cameraMaxDistance, 0)) *
        this.cameraMotionRate; // scaling factor for movement towads target
      // https://doc.babylonjs.com/typedoc/classes/BABYLON.Vector3#scaleandaddtoref
      cameraDirection.scaleAndAddToRef(amount, this.camera.position); //scales and moves the camera direction
      this.camera.position.y +=
        (this.player!.position.y + this.cameraOffsetY - this.camera.position.y) *
        this.cameraMotionRate;
    });

  }

  public onUpdate(): void {
    // GLTF use quaternions for rotation so not mesh.rotation.y = value;
    //https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/center_origin/rotation_quaternions
    var keydown = false;
    if (this.keyDownMap!["j"] || this.keyDownMap!["ArrowLeft"]) {
      this.idleAnim!.stop();
      this.walkAnim!.start(true);
      this.player!.position.addInPlace(this.stepl);
      this.player!.rotationQuaternion = this.left;
      console.log("left");
      keydown = true;
    }
    if (this.keyDownMap!["k"] || this.keyDownMap!["ArrowDown"]) {
      this.idleAnim!.stop();
      this.walkAnim!.start(true);
      this.player!.position.addInPlace(this.stepb);
      this.player!.rotationQuaternion = this.backward;
      console.log("down");
      keydown = true;
    }
    if (this.keyDownMap!["l"] || this.keyDownMap!["ArrowRight"]) {
      this.idleAnim!.stop();
      this.walkAnim!.start(true);
      this.player!.position.addInPlace(this.stepr);
      this.player!.rotationQuaternion = this.right;
      console.log("right");
      keydown = true;
    }
    if (this.keyDownMap!["i"] || this.keyDownMap!["ArrowUp"]) {
      this.idleAnim!.stop();
      this.walkAnim!.start(true);
      this.player!.position.addInPlace(this.stepf);
      this.player!.rotationQuaternion = this.forward;
      console.log("up");
      keydown = true;
    }
  /*  if (this.keyDownMap![" "] ) {
      //this.idleAnim!.stop();
      //this.walkAnim!.start(true);
      console.log("spacebar");
      this.player!.applyImpulse(new Vector3(0, 100, 0), this.player!.position);
      this.player!.rotationQuaternion = this.forward;
      keydown = true;
    }*/

    if (!keydown) {
      //stop walking animation if not moving
      if (this.walkAnim?.isPlaying) {
        this.walkAnim!.stop();
        this.idleAnim!.start(true);
      }
    }

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
