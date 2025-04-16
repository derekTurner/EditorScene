import {
  Color3,
  HavokPlugin,
  Mesh,
  MeshBuilder,
  Nullable,
  PhysicsAggregate,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeSphere,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
  public stash: { [key: string]: boolean } = {};
  
  private async goHavok(scene: Scene) {
    HavokPhysics().then((havok) => {
      const initializedHavok = havok;
    });

    const havokInstance: HavokPhysicsWithBindings = await HavokPhysics();
    const hk: HavokPlugin = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);
    return hk;
  }
  private sphere: Nullable<TransformNode> = null;
  private ground: Nullable<TransformNode> = null;
  private triggerShape: Nullable<PhysicsShapeSphere> = null;
  private triggerBody: Nullable<PhysicsBody> = null;
  private triggerShapeRepr: Nullable<Mesh> = null;
  private triggerTransform: Nullable<TransformNode> = null;
  private groundAggregate: Nullable<PhysicsAggregate> = null;
  private sphereAggregate: Nullable<PhysicsAggregate> = null;
  
  public constructor(public scene: Scene) {
    this.scene = scene;
  }

  public onStart(): void {
    this.goHavok(this.scene).then((hk) => {
      
      console.log("hk", hk);

      // define sphere shape
      this.sphere = MeshBuilder.CreateSphere(
        "sphere",
        { diameter: 10, segments: 32 },
        this.scene
      );
      this.sphere.position = new Vector3(0, 220, 0);
      this.sphereAggregate = new PhysicsAggregate(this.sphere, PhysicsShapeType.SPHERE, { mass: 0.1, restitution: 40, });

      // define ground box shape
      this.ground = this.scene.getMeshByName("ground");
      console.log(this.ground);
      this.ground?.setEnabled(true);
      this.groundAggregate = new PhysicsAggregate(this.ground!, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 10,
      });

      // define trigger shape
      var triggerShapeRadius = 12;
      this.triggerShape = new PhysicsShapeSphere(
        new Vector3(0, triggerShapeRadius, 0),
        triggerShapeRadius,
        this.scene
      );
      
      // create trigger shape representation
      this.triggerShapeRepr = MeshBuilder.CreateSphere("triggerShapeRepr", {
        diameter: triggerShapeRadius * 2,
      });
      this.triggerShapeRepr.position = new Vector3(0, triggerShapeRadius, 0);
      const material = new StandardMaterial("mat", this.scene);
      material.alpha = 0.7;
      material.diffuseColor = Color3.Red();
      this.triggerShapeRepr.material = material;
      //create trigger body and associate with shape
      this.triggerShape.isTrigger = true;
      this.triggerTransform = new TransformNode("triggerTransform");
      this.triggerBody = new PhysicsBody(
        this.triggerTransform,
        PhysicsMotionType.STATIC,
        false,
        this.scene
      );
      this.triggerBody.shape = this.triggerShape;
      /*
      triggerBody.setCollisionCallbackEnabled(true);
      console.log("triggerBody", triggerBody);

      const observableTrigger = triggerBody.getCollisionObservable();
      const observer = observableTrigger.add((collisionEvent) => {
  // Process collisions for the player
  //https://doc.babylonjs.com/features/featuresDeepDive/physics/collisionEvents
  console.log(collisionEvent);
});*/

      hk.onTriggerCollisionObservable.add((ev: any) => {
        console.log("trigger collision");
        console.log(ev);
        console.log(
          ev.type,
          ":",
          ev.collider.transformNode.name,
        )  })


    });
  }
  public onUpdate(): void {}
}
