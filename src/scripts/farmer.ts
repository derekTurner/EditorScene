import { Vector3 } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
    
    private ratio: number; 
    private step:Vector3 = new Vector3(0,0,7);

    public constructor(public mesh: Mesh) {
        this.ratio = this.mesh.getScene().getAnimationRatio();   
        this.step = this.step.scale(this.ratio);  
    }

    public onStart(): void {
        this.mesh.getScene().getAnimationGroupByName("Death")!.stop();
        this.mesh.getScene().getAnimationGroupByName("Walk")!.start(true);  
    }

    public onUpdate(): void {
        this.mesh.position.addInPlace(this.step);
    }
}
