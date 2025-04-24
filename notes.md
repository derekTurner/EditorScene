# EditorScene
 The aim here is to create a scene that can be used to test collisions.

 All the colllision code is held in the farmerController.ts file

A character controller is used to move around the scene.

The character controller uses the features of babylonjs physics version 2.0 which is based on the havok physics engine.
The havok physics engine is initialised by calling an asynchronous function.

```javascript
private async goHavok(scene: Scene): Promise<HavokPlugin> {
    HavokPhysics().then((havok) => {
      const initializedHavok = havok;
    });

    const havokInstance: HavokPhysicsWithBindings = await HavokPhysics();
    const hk: HavokPlugin = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);
    return hk;
  }
```

This returns a promise of a HavokPlugin object.  To ensure that the physics engine is initialised before the scene is rendered, the HavokPlugin is returned as a promise.  That means that any code that needs to use the physics engine needs to wait for the promise to be resolved.  This is done by calling the then() method on the promise.

The script farmerController.ts relates to the editor environment and uses a class SceneComponent which implements the IScript interface.  This must have In this case the promise is resolved inside the on start and onupdate methods.  The havok section is resolved in the onstart method.

**farmerControlled.ts**
```javascript
// imports from libraries
// user defined interfaces

export default class SceneComponent implements IScript {

// private class properties

//private class methods including goHavok()

private async goHavok(scene: Scene): Promise<HavokPlugin> {
    HavokPhysics().then((havok) => {
      const initializedHavok = havok;
    });

    const havokInstance: HavokPhysicsWithBindings = await HavokPhysics();
    const hk: HavokPlugin = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);
    return hk;
  }

  private animation1 = () => { ... // a frame animation

private collideCB = (collision: { ... // a collision callback

// class constructor which is attached in the editor to a mesh

public constructor(public mesh: Mesh) {
    // establish the scene and initialise properties which depend on the scene.
    this.scene = mesh.getScene();
    // initialise starting values in the scene
} // end of constructor

// private methods of the class.  If these are called from within the .then() method of the promise, then the promise will be resolved before the method is called and they can be used with physics

private getNextState() {... // controls state changes of the character controller.

private getDesiredVelocity() {... // calculates the desired velocity of the character controller and returns the outputvelocity as a Vector3

//onstart() is called when the scene is loaded
 public onStart(): void {
    // debugging can be done by  using the console.log() method or by adding content to the stash which can be displayed in a GUI from a gui.ts file.

    // create a character controller and associate it with the mesh an display capsule.
     this.characterController = new PhysicsCharacterController(
      (this.farmerPosition as Vector3).add(new Vector3(0, this.h / 2, 0)),
      { capsuleHeight: this.h, capsuleRadius: this.r },
      this.scene
    ); ...

    // add a function to the onAfterPhysicsObservable during which the character controller is updated.
    this.scene.onAfterPhysicsObservable.add(() => {...

    // add a function to the onKeyboardObservable to respond to keyboard events by setting up the character controller to move in the direction of the key pressed and to activate character animations.
    this.scene.onKeyboardObservable.add((kbInfo) => {...

    // resolve the promise to get the physics engine and enable physics in the scene.
    this.goHavok(this.scene).then((hk) => {

        //collect meshes from the scene and enable them.
        this.ground = this.scene.getMeshByName("ground");
        this.ground?.setEnabled(true);...

        // create physics aggregates for the ground and fcollision meshes.
         this.groundAggregate = new PhysicsAggregate(
            this.ground!,
            PhysicsShapeType.BOX,
            { mass: 0, restitution: 0.2, friction: 0.7 },
            this.scene
        );
        this.groundAggregate.body.setCollisionCallbackEnabled(false);...

        // call the collision handler function for selected  meshes.
        this.platform1Aggregate.body.getCollisionObservable().add(this.collideCB);...

        // add a function to the onBeforeRenderObservable to update position of the controler attached objects and the camera position.
        this.scene.onBeforeRenderObservable.add(() => {...

    } // end of then()


 } // end of onStart()

// onUpdate() is called every frame.  This is not used as we are using observables set up in the onStart() method to instigate actions at more precise times during the fraeme cycle.  The onUpdate() method is required to implement the IScript interface so cannot be omitted.

 public onUpdate(): void {
} // end of class
```


The editor uses the WASDQE keys to control the camera location so the scene can be viewed from different angles.  Therefore the arrow keys or jlik are used to move the character controller.


Branch: collisions3
Forest