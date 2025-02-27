import { ActionManager, ExecuteCodeAction, Scene } from "@babylonjs/core";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
  public keyDownMap: { [key: string]: boolean } = {};

  public constructor(public scene: Scene) {}

  public onStart(): void {
    this.scene.actionManager = new ActionManager(this.scene);

    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyDownTrigger,
        },
        (evt) => {
          this.keyDownMap[evt.sourceEvent.key] = true;
          console.log("key down");
          console.log(this.keyDownMap);
        }
      )
    );
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyUpTrigger,
        },
        (evt) => {
          this.keyDownMap[evt.sourceEvent.key] = false;
          console.log("key up");
        }
      )
    );
  }

  public onUpdate(): void {}
}
