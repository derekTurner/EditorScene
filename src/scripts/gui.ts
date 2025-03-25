import { ActionManager, ExecuteCodeAction, Scene } from "@babylonjs/core";
import { Button, AdvancedDynamicTexture, TextBlock , Control} from "@babylonjs/gui/2D";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
    public constructor(public scene: Scene) {
    }

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

      //https://doc.babylonjs.com/typedoc/modules/BABYLON.GUI  // GUI API

        let advancedTexture: AdvancedDynamicTexture =
        AdvancedDynamicTexture.CreateFullscreenUI("myUI", true, this.scene);
      let button1: Button = this.createSceneButton(
        "but1",
        "Click Here",
        "0px",
        "120px",
        advancedTexture
      );
      advancedTexture.addControl(button1); 

      //https://playground.babylonjs.com/#2ARI2W#10 //high resolution text
      this.scene.getEngine().setHardwareScalingLevel(1 / window.devicePixelRatio);  
      advancedTexture.rootContainer.scaleX = window.devicePixelRatio;
      advancedTexture.rootContainer.scaleY = window.devicePixelRatio;

      var text1 = new TextBlock("text1");
      text1.text = "Hello world";
      text1.color = "white";
      text1.fontSize = 24;
      text1.left = "100px";
      text1.top = "100px";
      text1.width = "200px";
      text1.height = "200px";
      
      text1.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT
      text1.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP
      advancedTexture.addControl(text1);    
  
    }

    public onUpdate(): void {
        
    }
}
