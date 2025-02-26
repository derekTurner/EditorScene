import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
    public constructor(public mesh: Mesh) { }

    public onStart(): void {
        this.mesh.getScene().getAnimationGroupByName("Death")!.stop();
        this.mesh.getScene().getAnimationGroupByName("Idle")!.start(true);
    }

    public onUpdate(): void {
        //this.mesh.rotation.y += 0.04 * this.mesh.getScene().getAnimationRatio();
    }
}
