import { ActionManager, ExecuteCodeAction, Scene } from "@babylonjs/core";


import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
    public constructor(public scene: Scene) {
        this.scene = scene;
     }

public keyDownMap: { [key: string]: boolean } = {};
    public onStart(): void {
        
        this.scene.actionManager = new ActionManager(this.scene);

        this.scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        //parameters: 'w'
      },
      (evt) => {
        this.keyDownMap[evt.sourceEvent.key] = true;
      }    )
  );
  this.scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyUpTrigger,
      },
      (evt) => {
        this.keyDownMap[evt.sourceEvent.key] = false;
        console.log(this.keyDownMap);
      }    )
  );
    }

    public onUpdate(): void {
        
    }
}
