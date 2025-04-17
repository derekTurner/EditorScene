import {
  AnimationGroup,
  FreeCamera,
  CharacterSupportedState,
  PhysicsCharacterController,
  Quaternion,
  Vector3,
  KeyboardEventTypes,
  CharacterSurfaceInfo,
  MeshBuilder,
  Scene,
} from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { IScript } from "babylonjs-editor-tools";
// https://playground.babylonjs.com/#WO0H1U#13
// https://doc.babylonjs.com/typedoc/classes/BABYLON.PhysicsCharacterController
// https://doc.babylonjs.com/typedoc/classes/BABYLON.PhysicsCharacterController#checksupport
// https://doc.babylonjs.com/typedoc/interfaces/BABYLON.CharacterSurfaceInfo
// https://doc.babylonjs.com/typedoc/enums/BABYLON.CharacterSupportedState // unsupported 0, sliding 1, supported 2,

export default class SceneComponent implements IScript {
  private scene!: Scene;
    //stash for messages to other scripts via externalData
    public  stash: { [key: string]: string } = {"message": "Empty Stash"};

  private farmerPosition = new Vector3(-40, 0, 0);
  private h = 180;
  private r = 25;

  private facingAngle: number = (2 * Math.PI) / 2;
  private forwardAngle: number = (2 * Math.PI) / 2;
  private backwardAngle: number = (0 * Math.PI) / 2;
  private leftAngle: number = (1 * Math.PI) / 2;
  private rightAngle: number = (3 * Math.PI) / 2;

  // Character state
  private state: string = "IN_AIR";
  private inAirSpeed = 80.0;
  private onGroundSpeed = 1000.0;
  private jumpHeight = 50;
  private wantJump = false;
  private inputDirection = Vector3.Zero();

  private characterOrientation = Quaternion.Identity();
  private characterGravity = new Vector3(0, -100, 0);// not same as physics gravity

  // Spatial paramenters
  private forwardLocalSpace = new Vector3(0, 0, 1);
  private upWorld: Vector3 = this.characterGravity.normalizeToNew().scaleInPlace(-1.0);

  //Character properties

  private characterController!: PhysicsCharacterController;
  private camera!: FreeCamera;
  private down = new Vector3(0, -1, 0);
  private dt: number = 0;
  private displayCapsule!: Mesh; // for debugging

  //Support information
  private supportInfo!: CharacterSurfaceInfo;

  //Camera
  private cameraMaxDistance = 900;
  private cameraMinDistance = 600;
  private cameraMotionRate = 0.04;
  private cameraOffsetY = 500; // hold camera above target

  //Animation
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
    private keyDownMap: { [key: string]: boolean } | null = null;


  public constructor(public mesh: Mesh) {
    this.scene = this.mesh.getScene();
    this.camera = this.scene.activeCamera as FreeCamera;
    //animations
    this.ratio = this.mesh.getScene().getAnimationRatio();
    this.stepr = this.stepr.scale(this.ratio);
    this.stepl = this.stepl.scale(this.ratio);
    this.stepf = this.stepf.scale(this.ratio);
    this.stepb = this.stepb.scale(this.ratio);

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
     this.walkAnim = this.mesh.getScene().getAnimationGroupByName("Walk"); //wasd
     this.waveAnim = this.mesh.getScene().getAnimationGroupByName("Wave"); //
  }

  private getNextState() {
    // rotates state START_JUMP -> IN_AIR -> ON_GROUND -> IN_AIR
    // rotation triggered by wantjump true
    if (this.state == "IN_AIR") {
      if (
        this.supportInfo.supportedState == CharacterSupportedState.SUPPORTED
      ) {
        return "ON_GROUND";
      }
      return "IN_AIR";
    } else if (this.state == "ON_GROUND") {
      if (
        this.supportInfo.supportedState != CharacterSupportedState.SUPPORTED
      ) {
        return "IN_AIR";
      }

      if (this.wantJump) {
        return "START_JUMP";
      }
      return "ON_GROUND";
    } else if (this.state == "START_JUMP") {
      return "IN_AIR";
    }
  }

  private getDesiredVelocity() {
    let desiredVelocity: Vector3;
    let outputVelocity: Vector3;
    
    let forwardWorld: Vector3;
    // Update state
    let nextState = this.getNextState();
    if (nextState != this.state) {
      this.state = nextState!;
    }
// want to display value on GUI;
    this.stash.message = this.state;
    this.stash.x = this.inputDirection.x.toString();
    this.stash.z = this.inputDirection.z.toString();
    // Get important directions

    forwardWorld = this.forwardLocalSpace.applyRotationQuaternion(
      this.characterOrientation
    );

    if (this.state == "IN_AIR") {
      desiredVelocity = this.inputDirection
        .scale(this.inAirSpeed)
        .applyRotationQuaternion(this.characterOrientation);
      outputVelocity = this.characterController.calculateMovement(
        this.dt,
        forwardWorld,
        this.upWorld,//this.supportInfo.averageSurfaceNormal,
        this.characterController.getVelocity(),
        new Vector3 (0,0,0),//this.supportInfo.averageSurfaceVelocity,
        desiredVelocity,
        this.upWorld
      );
      // Restore to original vertical component
      outputVelocity.addInPlace(this.upWorld.scale(-outputVelocity.dot(this.upWorld)));
      outputVelocity.addInPlace(
        this.upWorld.scale(this.characterController.getVelocity().dot(this.upWorld))
      );
      // Add gravity
      outputVelocity.addInPlace(this.characterGravity.scale(this.dt));
      return outputVelocity;
    } else if (this.state == "ON_GROUND") {
      // Move character relative to the surface we're standing on
      // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
      // avoid artifacts caused by filtering of the output velocity when standing on moving objects.

      Quaternion.FromEulerAnglesToRef(
        0,
        this.camera.rotation.y + this.facingAngle,
        0,
        this.mesh.rotationQuaternion!
      );

      desiredVelocity = this.inputDirection
        .scale(this.onGroundSpeed)
        .applyRotationQuaternion(this.characterOrientation);

      outputVelocity = this.characterController.calculateMovement(
        this.dt,
        forwardWorld,
        this.supportInfo.averageSurfaceNormal,
        this.characterController.getVelocity(),
        this.supportInfo.averageSurfaceVelocity,
        desiredVelocity,
        this.upWorld
      );

      // Horizontal projection

      {
        outputVelocity.subtractInPlace(this.supportInfo.averageSurfaceVelocity);
        let inv1k = 1e-3;
        if (outputVelocity.dot(this.upWorld) > inv1k) {
          let velLen = outputVelocity.length();
          outputVelocity.normalizeFromLength(velLen);

          // Get the desired length in the horizontal direction
          let horizLen =
            velLen / this.supportInfo.averageSurfaceNormal.dot(this.upWorld);

          // Re project the velocity onto the horizontal plane
          let c = this.supportInfo.averageSurfaceNormal.cross(outputVelocity);
          outputVelocity = c.cross(this.upWorld);
          outputVelocity.scaleInPlace(horizLen);
        }
        outputVelocity.addInPlace(this.supportInfo.averageSurfaceVelocity);

        return outputVelocity;
      }
    } else if (this.state == "START_JUMP") {
      let u = Math.sqrt(2 * this.characterGravity.length() * this.jumpHeight);
      let curRelVel = this.characterController.getVelocity().dot(this.upWorld);
      return this.characterController
        .getVelocity()
        .add(this.upWorld.scale(u - curRelVel));
    } 
    //console.log("Error: Unknown state");
    return Vector3.Zero(); // only gets here is the state is not supported
  }

  public onStart(): void {
    console.log("farmerControlled.ts onStart");
    this.scene.addExternalData("stash", this.stash);
    
    this.characterController = new PhysicsCharacterController(
      (this.farmerPosition as Vector3).add(new Vector3(0, this.h / 2, 0)),
      { capsuleHeight: this.h, capsuleRadius: this.r },
      this.scene
    );
    this.mesh.setPositionWithLocalVector(
      this.characterController.getPosition()
    );
    // stop andmation[0] running by default
    this.deathAnim!.stop();
    this.idleAnim!.start(true);

    this.displayCapsule = MeshBuilder.CreateCapsule(
      "CharacterDisplay",
      {
        height: this.h,
        radius: this.r,
        tessellation: 5,
        orientation: Vector3.Up(),
      },
      this.scene
    );
    this.displayCapsule.setPositionWithLocalVector(
      this.characterController.getPosition()
    );

    // cylinder displayed for debugging

    // set up event handlers

    this.scene.onBeforeRenderObservable.add(() => {
      this.mesh.position.copyFrom(
        this.characterController
          .getPosition()
          .add(new Vector3(0, -this.h / 2, 0))
      );
      this.displayCapsule.position.copyFrom(
        this.characterController.getPosition()
      );

      // camera following
      // https://doc.babylonjs.com/typedoc/classes/BABYLON.FreeCamera
      // camera direction is the direction the camera is moving towards
      //
      var cameraDirection = this.camera.getDirection(new Vector3(0, 0, 1));
      cameraDirection.y = 0;
      cameraDirection.normalize();
      // https://doc.babylonjs.com/typedoc/classes/BABYLON.Vector3#lerp
      this.camera.setTarget(
        Vector3.Lerp(this.camera.getTarget(), this.mesh.position, 0.1) // moves the target towards the mesh position
      );
      var dist = Vector3.Distance(this.camera.position, this.mesh.position); // distance between camera and target
      const amount =
        (Math.min(dist - this.cameraMinDistance, 0) +
          Math.max(dist - this.cameraMaxDistance, 0)) *
        this.cameraMotionRate; // scaling factor for movement towads target
      // https://doc.babylonjs.com/typedoc/classes/BABYLON.Vector3#scaleandaddtoref
      cameraDirection.scaleAndAddToRef(amount, this.camera.position); //scales and moves the camera direction
      this.camera.position.y +=
        (this.mesh.position.y + this.cameraOffsetY - this.camera.position.y) *
        this.cameraMotionRate;
    });

    this.scene.onAfterPhysicsObservable.add(() => {
      if (this.scene.deltaTime == undefined) return;
      this.dt = this.scene.deltaTime / 1000.0;
      if (this.dt == 0) return;

      this.supportInfo = this.characterController.checkSupport(
        this.dt,
        this.down
      );
      Quaternion.FromEulerAnglesToRef(
        0,
        this.camera.rotation.y,
        0,
        this.characterOrientation
      );

      this.characterController.setVelocity(this.getDesiredVelocity());
      this.characterController.integrate(
        this.dt,
        this.supportInfo,
        this.characterGravity
      );
    });

    this.scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          if (kbInfo.event.key == "i" || kbInfo.event.key == "ArrowUp") {
            this.inputDirection.z = 1;
            this.facingAngle = this.forwardAngle;
            if (this.idleAnim!.isPlaying){
              this.idleAnim!.stop();
              this.walkAnim!.start(true);}
            
          } else if (
            kbInfo.event.key == "k" ||
            kbInfo.event.key == "ArrowDown"
          ) {
            this.inputDirection.z = -1;
            this.facingAngle = this.backwardAngle;
            if (this.idleAnim!.isPlaying){
              this.idleAnim!.stop();
              this.walkAnim!.start(true);}
          } else if (
            kbInfo.event.key == "j" ||
            kbInfo.event.key == "ArrowLeft"
          ) {
            this.inputDirection.x = -1;
            this.facingAngle = this.leftAngle;
            if (this.idleAnim!.isPlaying){
              this.idleAnim!.stop();
              this.walkAnim!.start(true);}
          } else if (
            kbInfo.event.key == "l" ||
            kbInfo.event.key == "ArrowRight"
          ) {
            this.inputDirection.x = 1;
            this.facingAngle = this.rightAngle;
            if (this.idleAnim!.isPlaying){
              this.idleAnim!.stop();
              this.walkAnim!.start(true);}
          } else if (kbInfo.event.key == " ") {
            this.wantJump = true;
          }
          break;
        case KeyboardEventTypes.KEYUP:
          if (
            kbInfo.event.key == "i" ||
            kbInfo.event.key == "k" ||
            kbInfo.event.key == "ArrowUp" ||
            kbInfo.event.key == "ArrowDown"
          ) {
            this.inputDirection.z = 0;
            if (this.walkAnim!.isPlaying){
              this.walkAnim!.stop();
              this.idleAnim!.start(true);}
          }
          if (
            kbInfo.event.key == "j" ||
            kbInfo.event.key == "l" ||
            kbInfo.event.key == "ArrowLeft" ||
            kbInfo.event.key == "ArrowRight"
          ) {
            this.inputDirection.x = 0;
            if (this.walkAnim!.isPlaying){
              this.walkAnim!.stop();
              this.idleAnim!.start(true);}
          } else if (kbInfo.event.key == " ") {
            this.wantJump = false;
          }
          break;
      }
    });
  }

  public onUpdate(): void {
    // Nothing here action is all in onStart
  }
}
