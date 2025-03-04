import { AnimationGroup, Quaternion, Vector3 } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
    
    private ratio: number; 
    private stepf:Vector3 = new Vector3(0,0,7); // +z
    private stepb:Vector3 = new Vector3(0,0,-7);// -z
    private stepr:Vector3 = new Vector3(7,0,0); // +x
    private stepl:Vector3 = new Vector3(-7,0,0);// -x

    private deathAnim:          AnimationGroup | null;
    private gun_ShootAnim:      AnimationGroup | null;
    private hitRecieveAnim:     AnimationGroup | null;
    private hitRecieve_2Anim:   AnimationGroup | null;
    private idleAnim:           AnimationGroup | null;
    private idle_GunAnim:       AnimationGroup | null;
    private idle_Gun_PointingAnim: AnimationGroup | null;
    private idle_Gun_ShootAnim: AnimationGroup | null;
    private idle_NeutralAnim:   AnimationGroup | null;
    private idle_SwordAnim:     AnimationGroup | null;
    private interactAnim:       AnimationGroup | null;
    private kick_LeftAnim:      AnimationGroup | null;
    private kick_RightAnim:     AnimationGroup | null;
    private punch_LeftAnim:     AnimationGroup | null;
    private punch_RightAnim:    AnimationGroup | null;
    private rollAnim:           AnimationGroup | null;
    private runAnim:            AnimationGroup | null;
    private run_backAnim:       AnimationGroup | null;
    private run_LeftAnim:       AnimationGroup | null;
    private run_RightAnim:      AnimationGroup | null;
    private run_ShootAnim:      AnimationGroup | null;
    private sword_slashAnim:    AnimationGroup | null;
    private walkAnim:           AnimationGroup | null;
    private waveAnim:           AnimationGroup | null;

    private animating: boolean = false;
    private keyDownMap: { [key: string]: boolean } | null = null;

    private forward: Quaternion = Quaternion.RotationAxis(new Vector3(0, 1, 0), (2 * Math.PI / 2));
    private backward: Quaternion = Quaternion.RotationAxis(new Vector3(0, 1, 0), (0 * Math.PI / 2));
    private left: Quaternion = Quaternion.RotationAxis(new Vector3(0, 1, 0), (1 * Math.PI / 2));
    private right: Quaternion = Quaternion.RotationAxis(new Vector3(0, 1, 0), (3 * Math.PI / 2));

        public constructor(public mesh: Mesh) {
            this.ratio = this.mesh.getScene().getAnimationRatio();   
            this.stepr = this.stepr.scale(this.ratio);  
            this.stepl = this.stepl.scale(this.ratio);
            this.stepf = this.stepf.scale(this.ratio);
            this.stepb = this.stepb.scale(this.ratio);
            

            //model animation groups
            this.deathAnim = this.mesh.getScene().getAnimationGroupByName("Death");//x
            this.gun_ShootAnim = this.mesh.getScene().getAnimationGroupByName("Gun_Shoot");//T
            this.hitRecieveAnim = this.mesh.getScene().getAnimationGroupByName("HitRecieve");//Y
            this.hitRecieve_2Anim = this.mesh.getScene().getAnimationGroupByName("HitRecieve_2");//U
            this.idleAnim = this.mesh.getScene().getAnimationGroupByName("Idle");//I
            this.idle_GunAnim = this.mesh.getScene().getAnimationGroupByName("Idle_Gun");//O
            this.idle_Gun_PointingAnim = this.mesh.getScene().getAnimationGroupByName("Idle_Gun_Pointing");//R
            this.idle_Gun_ShootAnim = this.mesh.getScene().getAnimationGroupByName("Idle_Gun_Shoot");//F
            this.idle_NeutralAnim = this.mesh.getScene().getAnimationGroupByName("Idle_Neutral");//G
            this.idle_SwordAnim = this.mesh.getScene().getAnimationGroupByName("Idle_Sword");//H
            this.interactAnim = this.mesh.getScene().getAnimationGroupByName("Interact");//I
            this.kick_LeftAnim = this.mesh.getScene().getAnimationGroupByName("Kick_Left");//v
            this.kick_RightAnim = this.mesh.getScene().getAnimationGroupByName("Kick_Right");//V
            this.punch_LeftAnim = this.mesh.getScene().getAnimationGroupByName("Punch_Left");//p
            this.punch_RightAnim = this.mesh.getScene().getAnimationGroupByName("Punch_Right");//P
            this.rollAnim = this.mesh.getScene().getAnimationGroupByName("Roll");//J
            this.runAnim = this.mesh.getScene().getAnimationGroupByName("Run");//
            this.run_backAnim = this.mesh.getScene().getAnimationGroupByName("Run_back");//
            this.run_LeftAnim = this.mesh.getScene().getAnimationGroupByName("Run_Left");//
            this.run_RightAnim = this.mesh.getScene().getAnimationGroupByName("Run_Right");//
            this.sword_slashAnim = this.mesh.getScene().getAnimationGroupByName("Sword_slash");//
            this.run_ShootAnim = this.mesh.getScene().getAnimationGroupByName("Run_Shoot");//
            this.walkAnim  = this.mesh.getScene().getAnimationGroupByName("Walk");//wasd
            this.waveAnim  = this.mesh.getScene().getAnimationGroupByName("Wave");//
        }
    public onStart(): void {
        this.deathAnim!.stop();
        this.idleAnim!.start(true);  
    }

    public onUpdate(): void {
        

        this.keyDownMap = this.mesh.getScene().getExternalData("keyDownMap");
        console.log(this.keyDownMap);
        // using jkli to move as wasd is used for camera movement
        // GLTF use quaternions for rotation so not mesh.rotation.y = value;
        //https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/center_origin/rotation_quaternions
        var keydown = false;
        if (this.keyDownMap!["j"] ) {
            this.idleAnim!.stop();
            this.walkAnim!.start(true);
            this.mesh.position.addInPlace(this.stepl);
            //this.mesh.rotation.y = 3 * Math.PI / 2;
            this.mesh.rotationQuaternion = this.left;
            keydown = true;
        }
        if (this.keyDownMap!["k"] ) {
            this.idleAnim!.stop();
            this.walkAnim!.start(true);
            this.mesh.position.addInPlace(this.stepb);
            //this.mesh.rotation.y = 2 * Math.PI / 2;
            this.mesh.rotationQuaternion = this.backward;
            keydown = true;
        }
        if (this.keyDownMap!["l"] ) {
            this.idleAnim!.stop();
            this.walkAnim!.start(true);
            this.mesh.position.addInPlace(this.stepr);
            //this.mesh.rotation.y = 1 * Math.PI / 2;
            this.mesh.rotationQuaternion = this.right;
            keydown = true;
        }
        if (this.keyDownMap!["i"] ) {
            this.idleAnim!.stop();
            this.walkAnim!.start(true);
            this.mesh.position.addInPlace(this.stepf);
            //this.mesh.rotation.y = 0* Math.PI / 2;
            this.mesh.rotationQuaternion = this.forward;
            keydown = true;
        }
    
        if(!keydown){
            //animating = false;
            this.walkAnim!.stop();
            this.idleAnim!.start(true);
        }
    
        //trigger non- looping animations from keyboard for testing
        //https://doc.babylonjs.com/typedoc/classes/BABYLON.AnimationGroup#start
        if (this.keyDownMap!["x"] || this.keyDownMap!["X"]) {
            //stopMe();
            this.deathAnim!.start(false, 1.0, this.deathAnim!.from, this.deathAnim!.to, false);
        }
        
        if (this.keyDownMap!["t"] || this.keyDownMap!["T"]) {
            this.gun_ShootAnim!.start(true);
        }
        if (this.keyDownMap!["y"] || this.keyDownMap!["Y"]) {
            this.hitRecieveAnim!.start(true);
        }
        if (this.keyDownMap!["o"] || this.keyDownMap!["O"]) {
            this.idle_GunAnim!.start(true);
        }
        if (this.keyDownMap!["r"] || this.keyDownMap!["R"]) {
            this.idle_Gun_PointingAnim!.start(true);
        }


    }
}
