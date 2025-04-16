import {
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  Vector3,
  TransformNode,
  Nullable,
} from "@babylonjs/core";
import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";
import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
  private ground: Nullable<TransformNode> = null;
  private platform1: Nullable<TransformNode> = null;
  private platform2: Nullable<TransformNode> = null;
  private platform3: Nullable<TransformNode> = null;
  private cube2: Nullable<TransformNode> = null;
  private groundAggregate: Nullable<PhysicsAggregate> = null;
  private platform1Aggregate: Nullable<PhysicsAggregate> = null;
  private platform2Aggregate: Nullable<PhysicsAggregate> = null;
  private platform3Aggregate: Nullable<PhysicsAggregate> = null;
  private cube2Aggregate: Nullable<PhysicsAggregate> = null;


  private async goHavok(scene: Scene): Promise<HavokPlugin> {
    HavokPhysics().then((havok) => {
      const initializedHavok = havok;
    });

    const havokInstance: HavokPhysicsWithBindings = await HavokPhysics();
    const hk: HavokPlugin = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);
    return hk;
  }

  public constructor(public scene: Scene) {}

  public onStart(): void {
    console.log("onStart");
    this.goHavok(this.scene).then((hk) => {
      this.ground = this.scene.getMeshByName("ground");
      this.ground?.setEnabled(true);
      this.platform1 = this.scene.getMeshByName("Platform1");
      this.platform1?.setEnabled(true);
      this.platform2 = this.scene.getMeshByName("Platform2");
      this.platform2?.setEnabled(true);
      this.platform3 = this.scene.getMeshByName("Platform3");
      this.platform3?.setEnabled(true);
      this.cube2 = this.scene.getMeshByName("Cube2");
      this.cube2?.setEnabled(true);

      //physics aggregates
      this.groundAggregate = new PhysicsAggregate(
        this.ground!,
        PhysicsShapeType.BOX,
        { mass: 0, restitution: 0.2, friction: 0.7 },
        this.scene
      );
      this.groundAggregate.body.setCollisionCallbackEnabled(true);

      this.platform1Aggregate = new PhysicsAggregate(
        this.platform1!,
        PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.3, friction: 0.7 },
        this.scene
      );
      this.platform1Aggregate.body.setCollisionCallbackEnabled(true);

      this.platform2Aggregate = new PhysicsAggregate(
        this.platform2!,
        PhysicsShapeType.BOX,
        { mass: 0.5, restitution: 0.3, friction: 0.7 },
        this.scene
      );
      this.platform2Aggregate.body.setCollisionCallbackEnabled(true);

      this.platform3Aggregate = new PhysicsAggregate(
        this.platform3!,
        PhysicsShapeType.BOX,
        { mass: 0.5, restitution: 0.3, friction: 0.7 },
        this.scene
      );
      this.platform3Aggregate.body.setCollisionCallbackEnabled(true);

      this.cube2Aggregate = new PhysicsAggregate(
        this.cube2!,
        PhysicsShapeType.BOX,
        { mass: 0.5, restitution: 0.3, friction: 0.7 },
        this.scene
      );
      this.cube2Aggregate.body.setCollisionCallbackEnabled(true);

      // functions to call on collision  
      var collideCB = function (collision: {
        // log collisions
        collider: { transformNode: { name: any } };
        point: any;
        distance: any;
        impulse: any;
        normal: any;
      }) {
        console.log(
          "collideCB",
          collision.collider.transformNode.name,
          collision.point,
          collision.distance,
          collision.impulse,
          collision.normal
        );
      };
      this.groundAggregate.body.getCollisionObservable().add(collideCB);
      this.platform1Aggregate.body.getCollisionObservable().add(collideCB);
      this.platform2Aggregate.body.getCollisionObservable().add(collideCB);
      this.platform3Aggregate.body.getCollisionObservable().add(collideCB);
      this.cube2Aggregate.body.getCollisionObservable().add(collideCB);
      
      
    });
  }
  public onUpdate(): void {
    //this.platform2?.dispose();
  }
}
