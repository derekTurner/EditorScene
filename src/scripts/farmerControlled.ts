import {
  FreeCamera,
  CharacterSupportedState,
  PhysicsCharacterController,
  Quaternion,
  Vector3,
  KeyboardEventTypes,
  CharacterSurfaceInfo,
  MeshBuilder,
} from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { IScript } from "babylonjs-editor-tools";
// https://playground.babylonjs.com/#WO0H1U#13
// https://doc.babylonjs.com/typedoc/classes/BABYLON.PhysicsCharacterController
// https://doc.babylonjs.com/typedoc/classes/BABYLON.PhysicsCharacterController#checksupport
// https://doc.babylonjs.com/typedoc/interfaces/BABYLON.CharacterSurfaceInfo
// https://doc.babylonjs.com/typedoc/enums/BABYLON.CharacterSupportedState // unsupported 0, sliding 1, supported 2,

export default class SceneComponent implements IScript {
  public farmerPosition = new Vector3(0, 0, 0);
  private h = 4;
  private r = 0.6;

  // Character state
  private state: String = "ON_GROUND";
  private inAirSpeed = 80.0;
  private onGroundSpeed = 100.0;
  private jumpHeight = 1.5;
  private wantJump = false;
  private inputDirection = new Vector3(0, 0, 0);
  private forwardLocalSpace = new Vector3(0, 0, 1);
  private characterOrientation = Quaternion.Identity();
  private currentVelocity = new Vector3(0, 0, 0);
  private characterGravity = new Vector3(0, -18, 0);

  //Character properties

  private characterPosition!: Vector3;
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
  private cameraOffsetY = 500;  // hold camera above target


  public constructor(public mesh: Mesh) {
    this.camera = this.mesh.getScene().activeCamera as FreeCamera;
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
    // Update state
    let nextState = this.getNextState();
    if (nextState != this.state) {
      this.state = nextState!;
    }
    
    // Get important directions
    let upWorld = this.characterGravity.normalizeToNew();
    upWorld.scaleInPlace(-1.0);
    let forwardWorld = this.forwardLocalSpace.applyRotationQuaternion(
      this.characterOrientation
    );

    if (this.state == "IN_AIR") {
      let desiredVelocity = this.inputDirection
        .scale(this.inAirSpeed)
        .applyRotationQuaternion(this.characterOrientation);
      let outputVelocity = this.characterController.calculateMovement(
        this.dt,
        forwardWorld,
        this.supportInfo.averageSurfaceNormal,
        this.currentVelocity,
        this.supportInfo.averageSurfaceVelocity,
        desiredVelocity,
        upWorld
      );
      // Restore to original vertical component
      outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
      outputVelocity.addInPlace(
        upWorld.scale(this.currentVelocity.dot(upWorld))
      );
      // Add gravity
      outputVelocity.addInPlace(this.characterGravity.scale(this.dt));
      return outputVelocity;
    } // TODO
    else if (this.state == "ON_GROUND") {
      // Move character relative to the surface we're standing on
      // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
      // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
      let desiredVelocity = this.inputDirection

        .scale(this.onGroundSpeed)
        .applyRotationQuaternion(this.characterOrientation);

      let outputVelocity = this.characterController.calculateMovement(
        this.dt,
        forwardWorld,
        this.supportInfo.averageSurfaceNormal,
        this.currentVelocity,
        this.supportInfo.averageSurfaceVelocity,
        desiredVelocity,
        upWorld
      );
      // Horizontal projection
      {
        outputVelocity.subtractInPlace(this.supportInfo.averageSurfaceVelocity);
        let inv1k = 1e-3;
        if (outputVelocity.dot(upWorld) > inv1k) {
          let velLen = outputVelocity.length();
          outputVelocity.normalizeFromLength(velLen);

          // Get the desired length in the horizontal direction
          let horizLen =
            velLen / this.supportInfo.averageSurfaceNormal.dot(upWorld);

          // Re project the velocity onto the horizontal plane
          let c = this.supportInfo.averageSurfaceNormal.cross(outputVelocity);
          outputVelocity = c.cross(upWorld);
          outputVelocity.scaleInPlace(horizLen);
        }
        outputVelocity.addInPlace(this.supportInfo.averageSurfaceVelocity);
        return outputVelocity;
      }
    } 
    else if (this.state == "START_JUMP") {} // TODO
    return Vector3.Zero(); // only gets here is the state is not supported
  }

  public onStart(): void {
    this.characterController = new PhysicsCharacterController(
      this.farmerPosition,
      { capsuleHeight: this.h, capsuleRadius: this.r },
      this.mesh.getScene()
    );
    this.mesh.setPositionWithLocalVector(
      this.characterController.getPosition()
    );

    this.displayCapsule = MeshBuilder.CreateCapsule(
      "CharacterDisplay",
      { height: 40, radius: 5, tessellation: 12 , orientation: Vector3.Up() },
      this.mesh.getScene()
    ); // for debugging


    // set up event handlers

    this.mesh.getScene().onBeforeRenderObservable.add((_) => {
      // this.characterController = this.mesh.getScene().getExternalData("farmerController")!;
      this.mesh.position.copyFrom(this.characterController.getPosition());
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
        Vector3.Lerp(this.camera.getTarget(), this.mesh.position, 0.1)// moves the target towards the mesh position
      );
      var dist = Vector3.Distance(this.camera.position, this.mesh.position);// distance between camera and target
      const amount = (Math.min(dist - this.cameraMinDistance, 0) + Math.max(dist - this.cameraMaxDistance, 0)) * this.cameraMotionRate;// scaling factor for movement towads target
      // https://doc.babylonjs.com/typedoc/classes/BABYLON.Vector3#scaleandaddtoref
      cameraDirection.scaleAndAddToRef(amount, this.camera.position);//scales and moves the camera direction
      this.camera.position.y +=
        (this.mesh.position.y + this.cameraOffsetY - this.camera.position.y) * this.cameraMotionRate;
    });

    this.mesh.getScene().onAfterPhysicsObservable.add((_) => {
      if (this.mesh.getScene().deltaTime == undefined) return;
      this.dt = this.mesh.getScene().deltaTime / 1000.0;
      if (this.dt == 0) return;

      this.supportInfo = this.characterController.checkSupport(
        this.dt,
        this.down
      );
      this.mesh.getScene().cameras[0];
      Quaternion.FromEulerAnglesToRef(
        0,
        this.camera.rotation.y,
        0,
        this.characterOrientation
      );
      let desiredLinearVelocity = this.getDesiredVelocity();
      this.characterController.setVelocity(desiredLinearVelocity!);
      this.characterController.integrate(
        this.dt,
        this.supportInfo,
        this.characterGravity
      );
    });

    this.mesh.getScene().onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          if (kbInfo.event.key == "i" || kbInfo.event.key == "ArrowUp") {
            this.inputDirection.z = 1;
            console.log("up");
            this.characterController.getPosition()
          } else if (
            kbInfo.event.key == "k" ||
            kbInfo.event.key == "ArrowDown"
          ) {
            this.inputDirection.z = -1;
            console.log("down");
            this.characterController.getPosition()
          } else if (
            kbInfo.event.key == "j" ||
            kbInfo.event.key == "ArrowLeft"
          ) {
            this.inputDirection.x = -1;
            console.log("left");
            this.characterController.getPosition()
          } else if (
            kbInfo.event.key == "l" ||
            kbInfo.event.key == "ArrowRight"
          ) {
            this.inputDirection.x = 1;
            console.log("right");
            this.characterController.getPosition()
          } else if (kbInfo.event.key == " ") {
            this.wantJump = true;
          }
          break;
        case KeyboardEventTypes.KEYUP:
          if (
            kbInfo.event.key == "w" ||
            kbInfo.event.key == "s" ||
            kbInfo.event.key == "ArrowUp" ||
            kbInfo.event.key == "ArrowDown"
          ) {
            this.inputDirection.z = 0;
          }
          if (
            kbInfo.event.key == "a" ||
            kbInfo.event.key == "d" ||
            kbInfo.event.key == "ArrowLeft" ||
            kbInfo.event.key == "ArrowRight"
          ) {
            this.inputDirection.x = 0;
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
