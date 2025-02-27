import { Vector3 } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
    private ratio: number; 

    public constructor(public mesh: Mesh) { 
        this.mesh = mesh   ;
        this.ratio = this.mesh.getScene().getAnimationRatio();
    }

    public onStart(): void {
        
    }
    

    public onUpdate(): void {

        this.mesh.position.z += 1 * this.ratio;
        this.mesh.rotation.y += 0.04 * this.ratio;
    }
}
