import {  Color3, ExecuteCodeAction, HavokPlugin, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeSphere, PhysicsShapeType, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
  public stash: { [key: string]: boolean } = {};

  public constructor(public scene: Scene) {}

  public onStart(): void {
    var hk = new HavokPlugin();
    this.scene.enablePhysics(undefined, hk);
    var sphere = MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, this.scene);
    sphere.position.y = 1;
    new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, {mass: 1});
    var ground = MeshBuilder.CreateGround("ground", {width: 6, height: 6}, this.scene);
    sphere.position.y = 4;
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, {mass: 0, restitution: 1});
    var triggerShapeRadius = 2;
    var triggerShape = new PhysicsShapeSphere(new Vector3(0,0,0), triggerShapeRadius, this.scene);
    const triggerShapeRepr = MeshBuilder.CreateSphere("triggerShapeRepr", {diameter: triggerShapeRadius*2});
    const material = new StandardMaterial("mat", this.scene);
    material.alpha = 0.7;
    material.diffuseColor = Color3.Red();
    triggerShapeRepr.material = material;
    triggerShape.isTrigger = true;
    var triggerTransform = new TransformNode("triggerTransform");
    var triggerBody = new PhysicsBody(triggerTransform, PhysicsMotionType.STATIC, false, this.scene);
    triggerBody.shape = triggerShape;

    hk.onTriggerCollisionObservable.add((ev) => {
        // console.log(ev);
        console.log(ev.type, ':', ev.collider.transformNode.name, '-', ev.collidedAgainst.transformNode.name);
    });
  }  
  
  public onUpdate(): void {}
}
