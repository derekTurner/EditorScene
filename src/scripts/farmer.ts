// https://playground.babylonjs.com/#7XBR3M#9
import {
  Animation,
  Animatable,
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
  PhysicsPrestepType,
  PhysicsViewer,
  PhysicsMotionType,
  MeshBuilder,
} from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { DebugLayer } from "@babylonjs/core/Debug/debugLayer";
import { IScript } from "babylonjs-editor-tools";

interface PositionArray {
  frame: number;
  value: number;
}

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
  private ground: Nullable<TransformNode> = null;
  private platform1: Nullable<TransformNode> = null;
  private platform2: Nullable<TransformNode> = null;
  private platform3: Nullable<TransformNode> = null;
  private cube1: Nullable<TransformNode> = null;
  private cube2: Nullable<TransformNode> = null;
  private player: Nullable<TransformNode> = null;
  private detector: Nullable<TransformNode> = null;
  private activator: Nullable<TransformNode> = null;

  private groundAggregate: Nullable<PhysicsAggregate> = null;
  private platform1Aggregate: Nullable<PhysicsAggregate> = null;
  private platform2Aggregate: Nullable<PhysicsAggregate> = null;
  private platform3Aggregate: Nullable<PhysicsAggregate> = null;
  private cube1Aggregate: Nullable<PhysicsAggregate> = null;
  private cube2Aggregate: Nullable<PhysicsAggregate> = null;
  private playerAggregate: Nullable<PhysicsAggregate> = null;
  private detectorAggregate: Nullable<PhysicsAggregate> = null;

  private root = new TransformNode("root", this.scene);
  private display: Nullable<Mesh> = null;

  //animation parameters
  private frameRate: number = 30;
  private anim1!: Animatable;
  private time: number = 0;
  private isAnimating1: boolean = false;

  // animation which can be pushed to the animations array of a mesh
  private animation1 = () => {
    const range = 200;
    const frameCount = 2 * this.frameRate;
    const startValue = this.platform1!.position.y;
    const ySlide = new Animation(
      "ySlide",
      "position.y",
      this.frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const keyFramesY: PositionArray[] = [];
    keyFramesY.push({ frame: 0, value: startValue });
    keyFramesY.push({ frame: frameCount / 2, value: range });
    keyFramesY.push({
      frame: frameCount - 1,
      value:
        startValue + (range * (this.frameRate / 2 - 1)) / (this.frameRate / 2),
    });
    ySlide.setKeys(keyFramesY);
    return ySlide;
  };

  // functions to call on collision
  private collideCB = (collision: {
    // log collisions
    collider: { transformNode: { name: any } };
    collidedAgainst: { transformNode: { name: any } };
    point: any;
    distance: any;
    impulse: any;
    normal: any;
  }) => {
    console.log(
      "collideCB",
      collision.collider.transformNode.name,
      collision.collidedAgainst.transformNode.name
      //collision.point,
      //collision.distance,
      //collision.impulse,
      //collision.normal
    );
  };

  private collideCB1 = (collision: {
    // log collisions
    collider: { transformNode: { name: any } };
    collidedAgainst: { transformNode: { name: any } };
    point: any;
    distance: any;
    impulse: any;
    normal: any;
  }) => {
    console.log(
      "collideCB1",
      collision.collider.transformNode.name,
      collision.collidedAgainst.transformNode.name
      //collision.point,
      //collision.distance,
      //collision.impulse,
      //collision.normal
    );
    if (!this.isAnimating1) {
      this.isAnimating1 = true;
      this.anim1 = this.scene.beginAnimation(
        this.platform1,
        0,
        2 * this.frameRate,
        true
      );

      // Set flag to false when animation completes
      this.anim1.onAnimationLoop = () => {
        this.anim1.stop();
        this.isAnimating1 = false;
      };
      //setTimeout(() => {this.anim1.stop()}, 5000);// loop for 5 seconds

      // Also handle the case where animation ends without looping
      this.anim1.onAnimationEnd = () => {
        this.isAnimating1 = false;
      };
    }
  };

  // function to check if the player is close to a platform
  private checkPlatform = (platform: TransformNode) => {
    const playerPos = this.player!.position.clone();
    const platformPos = platform.getAbsolutePosition();
    const distance = Vector3.Distance(playerPos, platformPos);
    if (distance < 100) {
      return true;
    } else {
      return false;
    }
  };

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

    this.display = MeshBuilder.CreateCapsule(
      "display",
      {
        height: 200,
        radius: 10,
        tessellation: 32,
      },
      this.scene
    );
    this.display.parent = this.root;
    this.display.position = new Vector3(0, 0, 0);

    this.playerAggregate = new PhysicsAggregate(
      this.root,
      PhysicsShapeType.CAPSULE,
      { mass: 0.1, restitution: 0, friction: 1, radius: 10 },
      this.scene
    );
    this.playerAggregate.body.setCollisionCallbackEnabled(true);
    this.player! = this.playerAggregate.transformNode;
    this.playerAggregate!.body.setMotionType(PhysicsMotionType.DYNAMIC);
    this.playerAggregate!.body.disablePreStep = false;
    this.playerAggregate!.body.setMassProperties({
      inertia: Vector3.ZeroReadOnly,
    });

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

    this.ground = this.scene.getMeshByName("ground");
    this.ground?.setEnabled(true);
    this.platform1 = this.scene.getMeshByName("Platform1");
    this.platform1?.setEnabled(true);
    this.platform2 = this.scene.getMeshByName("Platform2");
    this.platform2?.setEnabled(true);
    this.platform3 = this.scene.getMeshByName("Platform3");
    this.platform3?.setEnabled(true);
    this.cube1 = this.scene.getMeshByName("Cube1");
    this.cube1?.setEnabled(true);
    this.cube2 = this.scene.getMeshByName("Cube2");
    this.cube2?.setEnabled(true);
    this.detector = this.scene.getMeshByName("Detector");
    this.detector?.setEnabled(true);
    this.activator = this.scene.getMeshByName("Activator");
    this.activator?.setEnabled(true);
    //physics aggregates

    this.groundAggregate = new PhysicsAggregate(
      this.ground!,
      PhysicsShapeType.BOX,
      { mass: 0, restitution: 0.2, friction: 0.7 },
      this.scene
    );
    this.groundAggregate.body.setCollisionCallbackEnabled(false);

    this.cube1Aggregate = new PhysicsAggregate(
      this.cube1!,
      PhysicsShapeType.BOX,
      { mass: 0.5, restitution: 0.3, friction: 0.9 },
      this.scene
    );
    this.cube1Aggregate.body.setCollisionCallbackEnabled(true);
    this.cube1Aggregate.body.setPrestepType(PhysicsPrestepType.ACTION);
    this.cube1Aggregate.transformNode.animations.push(this.animation1());
    //this.scene.beginAnimation(this.cube1, 0, 2 * this.frameRate, true);

    this.cube2Aggregate = new PhysicsAggregate(
      this.cube2!,
      PhysicsShapeType.BOX,
      { mass: 0.5, restitution: 0.4, friction: 0.6 },
      this.scene
    );
    this.cube2Aggregate.body.setCollisionCallbackEnabled(true);
    this.cube2Aggregate.body.setPrestepType(PhysicsPrestepType.ACTION);

    this.platform1Aggregate = new PhysicsAggregate(
      this.platform1!,
      PhysicsShapeType.BOX,
      { mass: 0, restitution: 0.3, friction: 1 },
      this.scene
    );
    this.platform1Aggregate.body.setCollisionCallbackEnabled(true);
    this.platform1Aggregate.body.setPrestepType(PhysicsPrestepType.ACTION);
    this.platform1Aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
    this.platform1Aggregate.transformNode.animations.push(this.animation1());
    //this.scene.beginAnimation(this.platform1, 0, 2 * this.frameRate, true);

    this.platform2Aggregate = new PhysicsAggregate(
      this.platform2!,
      PhysicsShapeType.BOX,
      { mass: 0, restitution: 0.3, friction: 1 },
      this.scene
    );
    this.platform2Aggregate.body.setCollisionCallbackEnabled(true);

    this.platform3Aggregate = new PhysicsAggregate(
      this.platform3!,
      PhysicsShapeType.BOX,
      { mass: 0, restitution: 0.3, friction: 1 },
      this.scene
    );
    this.platform3Aggregate.body.setCollisionCallbackEnabled(true);

    this.cube2Aggregate = new PhysicsAggregate(
      this.cube2!,
      PhysicsShapeType.BOX,
      { mass: 0.5, restitution: 0.3, friction: 1 },
      this.scene
    );
    this.cube2Aggregate.body.setCollisionCallbackEnabled(true);

    // Filter grouping

    const FILTER_GROUP_GROUND = 1;
    const FILTER_GROUP_PLATFORM = 2;
    const FILTER_GROUP_CUBE = 3;
    const FILTER_GROUP_OBSTACLE = 4;
    const FILTER_GROUP_PLAYER = 5;
    // Filter masks
    this.groundAggregate.shape.filterMembershipMask = FILTER_GROUP_GROUND;
    this.platform1Aggregate.shape.filterMembershipMask = FILTER_GROUP_PLATFORM;
    this.platform2Aggregate.shape.filterMembershipMask = FILTER_GROUP_PLATFORM;
    this.platform3Aggregate.shape.filterMembershipMask = FILTER_GROUP_PLATFORM;
    this.cube1Aggregate.shape.filterMembershipMask = FILTER_GROUP_CUBE;
    this.cube2Aggregate.shape.filterMembershipMask = FILTER_GROUP_CUBE;
    this.playerAggregate!.shape.filterMembershipMask = FILTER_GROUP_PLAYER;

    this.platform1Aggregate.shape.filterCollideMask =
      FILTER_GROUP_CUBE | FILTER_GROUP_PLAYER;
    this.platform2Aggregate.shape.filterCollideMask =
      FILTER_GROUP_CUBE | FILTER_GROUP_PLAYER;
    this.platform3Aggregate.shape.filterCollideMask =
      FILTER_GROUP_CUBE | FILTER_GROUP_PLAYER;

    this.cube1Aggregate.shape.filterCollideMask =
      FILTER_GROUP_CUBE | FILTER_GROUP_PLATFORM | FILTER_GROUP_PLAYER;
    this.cube2Aggregate.shape.filterCollideMask =
      FILTER_GROUP_CUBE | FILTER_GROUP_PLATFORM | FILTER_GROUP_PLAYER;

    this.playerAggregate!.shape.filterCollideMask =
      FILTER_GROUP_PLATFORM | FILTER_GROUP_CUBE | FILTER_GROUP_OBSTACLE;
    // Add collision mask for ground
    this.groundAggregate.shape.filterCollideMask =
      FILTER_GROUP_CUBE | FILTER_GROUP_PLAYER | FILTER_GROUP_OBSTACLE;

    //this.groundAggregate.body.getCollisionObservable().add(this.collideCB);
    this.platform1Aggregate.body.getCollisionObservable().add(this.collideCB1);
    this.platform2Aggregate.body.getCollisionObservable().add(this.collideCB);
    this.platform3Aggregate.body.getCollisionObservable().add(this.collideCB);

    //this.cube2Aggregate.body.getCollisionObservable().add(this.collideCB);

    const physicsViewer = new PhysicsViewer();
    const debugMesh = physicsViewer.showBody(this.playerAggregate!.body);

    // setup action manager to handle key events
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

    //setup before render observable to update camera position
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
        Vector3.Lerp(
          this.camera.getTarget(),
          this.player!.position.clone(),
          0.1
        ) // moves the target towards the mesh position
      );
      var dist = Vector3.Distance(
        this.camera.position,
        this.player!.position.clone()
      ); // distance between camera and target
      const amount =
        (Math.min(dist - this.cameraMinDistance, 0) +
          Math.max(dist - this.cameraMaxDistance, 0)) *
        this.cameraMotionRate; // scaling factor for movement towads target
      // https://doc.babylonjs.com/typedoc/classes/BABYLON.Vector3#scaleandaddtoref
      cameraDirection.scaleAndAddToRef(amount, this.camera.position); //scales and moves the camera direction
      this.camera.position.y +=
        (this.player!.position.y +
          this.cameraOffsetY -
          this.camera.position.y) *
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
      this.playerAggregate!.body.setLinearVelocity(
        new Vector3(-90 * this.ratio, 0, 0)
      );
      //this.player!.position.addInPlace(this.stepl);

      this.player!.rotationQuaternion = this.left;
      console.log("left");
      keydown = true;
    }
    if (this.keyDownMap!["k"] || this.keyDownMap!["ArrowDown"]) {
      this.idleAnim!.stop();
      this.walkAnim!.start(true);
      this.playerAggregate!.body.setLinearVelocity(
        new Vector3(0, 0, -90 * this.ratio)
      );
      //this.player!.position.addInPlace(this.stepb);
      this.player!.rotationQuaternion = this.backward;
      console.log("down");
      keydown = true;
    }
    if (this.keyDownMap!["l"] || this.keyDownMap!["ArrowRight"]) {
      this.idleAnim!.stop();
      this.walkAnim!.start(true);
      this.playerAggregate!.body.setLinearVelocity(
        new Vector3(90 * this.ratio, 0, 0)
      );
      // this.player!.position.addInPlace(this.stepr);
      this.player!.rotationQuaternion = this.right;
      console.log("right");
      keydown = true;
    }
    if (this.keyDownMap!["i"] || this.keyDownMap!["ArrowUp"]) {
      this.idleAnim!.stop();
      this.walkAnim!.start(true);

      this.playerAggregate!.body.setLinearVelocity(
        new Vector3(0, 0, 90 * this.ratio)
      );
      //this.player!.position.addInPlace(this.stepf);
      this.player!.rotationQuaternion = this.forward;
      console.log("up");
      keydown = true;
    }
    // Modify the spacebar handling
    if (this.keyDownMap![" "]) {
      console.log("spacebar jump");
      this.playerAggregate!.body.setLinearVelocity(
        this.playerAggregate!.body.getLinearVelocity()
          .clone()
          .addInPlace(new Vector3(0, 90, 0 * this.ratio))
      );

      keydown = true;
    }

    if (!keydown) {
      //stop walking animation if not moving
      if (this.walkAnim?.isPlaying) {
        this.walkAnim!.stop();
        this.idleAnim!.start(true);
        this.playerAggregate!.body.setLinearVelocity(new Vector3(0, 0, 0));
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
