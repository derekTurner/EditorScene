import { ActionManager, Color3, ExecuteCodeAction, Scene } from "@babylonjs/core";
import {
  Button,
  AdvancedDynamicTexture,
  TextBlock,
  Control,
  Grid,
  Rectangle,
} from "@babylonjs/gui/2D";

import { IScript } from "babylonjs-editor-tools";

export default class SceneComponent implements IScript {
  private text1!: TextBlock; // recieves external messages
  private text2!: TextBlock; // recieves external messages
  private text3!: TextBlock; // recieves external messages
  private text4!: TextBlock; // recieves external messages
  private heading1!: TextBlock;
  
  public constructor(public scene: Scene) {}

  private createSceneButton(
    name: string,
    index: string,
    x: string,
    y: string,
    //advtex: { addControl: (arg0: Button) => void }
  ) {
    var button: Button = Button.CreateSimpleButton(name, index);
    button.left = x;
    button.top = y;
    button.width = "180px";
    button.height = "35px";
    button.color = "white";
    button.cornerRadius = 20;
    button.background = "green";

    button.onPointerClickObservable.add(function () {
      console.log("click event");
      let toggle:string = button.textBlock!.text == "clicked" ? "Click me!" :"clicked";
      button.textBlock!.text = toggle;
      console.log(toggle);
    });
   // advtex.addControl(button);
    return button;
  }

  private createTextBlock(
    name: string,
    index: string,
    left: string,
    top: string
  ) {
    let text: TextBlock = new TextBlock(name, index);
    text.text = index;
    text.color = "white";
    text.fontSize = 24;
    text.left = left;
    text.top = top;
    text.width = "200px";
    text.height = "46px";
    text.fontFamily = "Verdana";
    text.textWrapping = true;
    text.highlightColor = "red";
    text.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
    text.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
    // event handling
    text.onPointerEnterObservable.add(function () {
      text.isHighlighted = true;
    });
    text.onPointerOutObservable.add(function () {
      text.isHighlighted = false;
    });
    return text;
  }

  public onStart(): void {
    // add a button
    //https://doc.babylonjs.com/typedoc/modules/BABYLON.GUI  // GUI API

    let advancedTexture: AdvancedDynamicTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("myUI", true, this.scene);
    let button1: Button = this.createSceneButton(
      "button1",
      "Click Me!",
      "0px",
      "0px",
      //advancedTexture
    );
    //advancedTexture.addControl(button1); // button 1 could be added to the scene or grid

    //add text block
    //https://playground.babylonjs.com/#2ARI2W#10 //high resolution text//
    this.scene.getEngine().setHardwareScalingLevel(1 / window.devicePixelRatio);
    advancedTexture.rootContainer.scaleX = window.devicePixelRatio;
    advancedTexture.rootContainer.scaleY = window.devicePixelRatio;

    this.heading1 = this.createTextBlock("heading1", "Hello World", "1px", "1px");
    this.text1 = this.createTextBlock("text1", "Debug", "1px", "1px");
    this.text2 = this.createTextBlock("text2", "Debug", "1px", "1px");
    this.text3 = this.createTextBlock("text3", "Debug", "1px", "1px");
    this.text4 = this.createTextBlock("text4", "Debug", "1px", "1px");

   
    // advancedTexture.addControl(this.heading1); // text1 block could be added to the scene or grid


//https://doc.babylonjs.com/features/featuresDeepDive/gui/gui#grid
// Create a grid, Pointer will then only apply to the grid and not the whole screen.

const grid = new Grid();
grid.addColumnDefinition(100, true);
grid.addColumnDefinition(0.25);
grid.addColumnDefinition(0.25);
grid.addColumnDefinition(0.25);
grid.addColumnDefinition(0.25);
grid.addColumnDefinition(100, true);
grid.addRowDefinition(50, true);
grid.addRowDefinition(50, true);

// This rect will be on first row and second column
const rect1 = new Rectangle();
rect1.background = "#76d56e88"; //rgba
rect1.thickness = 0;
rect1.addControl(this.heading1);  // rect is a container which can contain other controls
const rect2 = new Rectangle();
rect2.background = "#60955b88";
rect2.thickness = 0;
rect2.addControl(button1);
const rect3 = new Rectangle();
rect3.background = "#76d56e88";
rect3.thickness = 0;
//empty rect
const rect4 = new Rectangle();
rect4.background = "#60955b88";
rect4.thickness = 0;
//empty rect
const rect5 = new Rectangle();
rect5.background = "#76d56e88";
rect5.thickness = 0;
rect5.addControl(this.text1);
const rect6 = new Rectangle();
rect6.background = "#60955b88";
rect6.thickness = 0;
rect6.addControl(this.text2);
const rect7 = new Rectangle();
rect7.background = "#76d56e88";
rect7.thickness = 0;
rect7.addControl(this.text3);
const rect8 = new Rectangle();
rect8.background = "#60955b88";
rect8.thickness = 0;
rect8.addControl(this.text4);

grid.addControl(rect1, 0, 1);
grid.addControl(rect2, 0, 2);
grid.addControl(rect3, 0, 3);
grid.addControl(rect4, 0, 4);
grid.addControl(rect5, 1, 1);
grid.addControl(rect6, 1, 2);
grid.addControl(rect7, 1, 3);
grid.addControl(rect8, 1, 4);

advancedTexture.addControl(grid);





this.scene.registerBeforeRender(() => {
  // cant get to gui
  let mystash = this.scene.getExternalData("stash") as { [key: string]: string };

  this.text1.text = mystash.message;
  this.text2.text = mystash.x; // Desired direction
  this.text3.text = mystash.z; // Desired direction
});  }





  public onUpdate(): void {}
}
