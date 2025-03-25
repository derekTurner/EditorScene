import { ActionManager, ExecuteCodeAction, Scene } from "@babylonjs/core";
import { Button, AdvancedDynamicTexture } from "@babylonjs/gui/2D";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
    public constructor(public scene: Scene) {}

    private createSceneButton(
        name: string,
        index: string,
        x: string,
        y: string,
        advtex: { addControl: (arg0: Button) => void }
      ) {
        var button: Button = Button.CreateSimpleButton(name, index);
        button.left = x;
        button.top = y;
        button.width = "180px";
        button.height = "35px";
        button.color = "white";
        button.cornerRadius = 20;
        button.background = "green";
        
        button.onPointerUpObservable.add(function () {
          console.log("Button clicked");
        });
        advtex.addControl(button);
        return button;
      }

    public onStart(): void {
        let advancedTexture: AdvancedDynamicTexture =
        AdvancedDynamicTexture.CreateFullscreenUI("myUI", true);
      let button1: Button = this.createSceneButton(
        "but1",
        "Click Here",
        "0px",
        "120px",
        advancedTexture
      );
    }

    public onUpdate(): void {
        
    }
}
