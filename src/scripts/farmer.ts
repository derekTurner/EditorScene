import { AnimationGroup, Vector3 } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
    
    private ratio: number; 
    private step:Vector3 = new Vector3(0,0,7);

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
    private keyDownMap: { [key: string]: boolean } | null;

        public constructor(public mesh: Mesh) {
            this.ratio = this.mesh.getScene().getAnimationRatio();   
            this.step = this.step.scale(this.ratio);  
            
            

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
            this.kick_LeftAnim = this.mesh.getScene().getAnimationGroupByName("Kick_Left");//k
            this.kick_RightAnim = this.mesh.getScene().getAnimationGroupByName("Kick_Right");//K
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
        if (this.keyDownMap && this.keyDownMap["y"]) {
            this.idleAnim!.stop();
            this.walkAnim!.start(true);
            this.mesh.position.addInPlace(this.step);
            ////this.mesh.position.z += 0.1;
            //this.mesh.rotation.y = 0* Math.PI / 2;
            //keydown = true;
            console.log("y key is down");
        }
    }
}
