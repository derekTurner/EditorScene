import {
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  Vector3,
  TransformNode,
  Nullable,
  Animation,
  PhysicsPrestepType,
  Animatable,
} from "@babylonjs/core";
import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";
import { IScript } from "babylonjs-editor-tools";

interface PositionArray {
  frame: number;
  value: number;
}

export default class SceneComponent implements IScript {
 
  

  private ground: Nullable<TransformNode> = null;
  private platform1: Nullable<TransformNode> = null;
  private platform2: Nullable<TransformNode> = null;
  private platform3: Nullable<TransformNode> = null;
  private cube1: Nullable<TransformNode> = null;
  private cube2: Nullable<TransformNode> = null;
  private player: Nullable<TransformNode> = null;
  private groundAggregate: Nullable<PhysicsAggregate> = null;
  private platform1Aggregate: Nullable<PhysicsAggregate> = null;
  private platform2Aggregate: Nullable<PhysicsAggregate> = null;
  private platform3Aggregate: Nullable<PhysicsAggregate> = null;
  private cube1Aggregate: Nullable<PhysicsAggregate> = null;
  private cube2Aggregate: Nullable<PhysicsAggregate> = null;
  private playerAggregate: Nullable<PhysicsAggregate> = null;

  
  //animation parameters
  private  frameRate: number = 30;
  private anim1: Animatable ;


  private async goHavok(scene: Scene): Promise<HavokPlugin> {
    HavokPhysics().then((havok) => {
      const initializedHavok = havok;
    });

    const havokInstance: HavokPhysicsWithBindings = await HavokPhysics();
    const hk: HavokPlugin = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);
    return hk;
  }

  // animation which can be pushed to the animations array of a mesh
  private animation1 = () => {
    const range = 200;
    const xSlide = new Animation(
      "xSlide",
      "position.x",
      this.frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const keyFramesX: PositionArray[] = [];
    keyFramesX.push({ frame: 0, value: range });
    keyFramesX.push({ frame: this.frameRate, value: -1 * range });
    keyFramesX.push({
      frame: 2 * this.frameRate - 1,
      value:
        -1 * range +
        (2 * range * (this.frameRate / 2 - 1)) / (this.frameRate / 2),
    });
    xSlide.setKeys(keyFramesX);
    return xSlide;
  };

  // functions to call on collision
  private collideCB =  (collision: {
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
      collision.collidedAgainst.transformNode.name,
      //collision.point,
      //collision.distance,
      //collision.impulse,
      //collision.normal
    );
    this.anim1 = this.scene.beginAnimation(this.platform1, 0, 2 * this.frameRate, true);
    //setTimeout(() => {this.anim1.stop()}, 5000);// loop for 5 seconds
    this.anim1.onAnimationLoop = () => {
      this.anim1.stop();
    }; // stops on one cycle
  };

  public constructor(public scene: Scene) {}

  public onStart(): void {
    console.log("collisions.ts onStart");
    this.goHavok(this.scene).then((hk) => {
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
      this.player = this.scene.getMeshByName("CharacterDisplay");
      this.player?.setEnabled(true);


      //physics aggregates
      /*
      this.groundAggregate = new PhysicsAggregate(
        this.ground!,
        PhysicsShapeType.BOX,
        { mass: 0, restitution: 0.2, friction: 0.7 },
        this.scene
      );
      this.groundAggregate.body.setCollisionCallbackEnabled(false);
      */
      

      this.cube1Aggregate = new PhysicsAggregate(
        this.cube1!,
        PhysicsShapeType.BOX,
        { mass: 0, restitution: 0.3, friction: 0.9 },
        this.scene
      );
      this.cube1Aggregate.body.setCollisionCallbackEnabled(true);
      this.cube1Aggregate.body.setPrestepType(PhysicsPrestepType.ACTION);
      this.cube1Aggregate.transformNode.animations.push(this.animation1());
      //this.scene.beginAnimation(this.cube1, 0, 2 * this.frameRate, true);

      this.platform1Aggregate = new PhysicsAggregate(
        this.platform1!,
        PhysicsShapeType.BOX,
        { mass: 0, restitution: 0.3, friction: 0.9 },
        this.scene
      );
      this.platform1Aggregate.body.setCollisionCallbackEnabled(true);
      this.platform1Aggregate.body.setPrestepType(PhysicsPrestepType.ACTION);
      this.platform1Aggregate.transformNode.animations.push(this.animation1());
      //this.scene.beginAnimation(this.platform1, 0, 2 * this.frameRate, true);

      this.platform2Aggregate = new PhysicsAggregate(
        this.platform2!,
        PhysicsShapeType.BOX,
        { mass: 0, restitution: 0.3, friction: 0.9 },
        this.scene
      );
      this.platform2Aggregate.body.setCollisionCallbackEnabled(true);

      this.platform3Aggregate = new PhysicsAggregate(
        this.platform3!,
        PhysicsShapeType.BOX,
        { mass: 0, restitution: 0.3, friction: 0.9 },
        this.scene
      );
      this.platform3Aggregate.body.setCollisionCallbackEnabled(true);

      this.cube2Aggregate = new PhysicsAggregate(
        this.cube2!,
        PhysicsShapeType.BOX,
        { mass: 0.5, restitution: 0.3, friction: 0.9 },
        this.scene
      );
      this.cube2Aggregate.body.setCollisionCallbackEnabled(true);

      this.playerAggregate = new PhysicsAggregate(
        this.player!,  
        PhysicsShapeType.BOX,
        { mass: 0.5, restitution: 0.3, friction: 0.9 },
        this.scene
      );

      
      //this.groundAggregate.body.getCollisionObservable().add(this.collideCB);
      this.platform1Aggregate.body.getCollisionObservable().add(this.collideCB);
      this.platform2Aggregate.body.getCollisionObservable().add(this.collideCB);
      this.platform3Aggregate.body.getCollisionObservable().add(this.collideCB);

      //this.cube2Aggregate.body.getCollisionObservable().add(this.collideCB);
      //this.playerAggregate.body.getCollisionObservable().add(this.collideCB);
      
    });  }
  public onUpdate(): void {
    //this.platform2?.dispose();
  }
}
