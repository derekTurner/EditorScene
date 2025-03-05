import { Color3, CreateGroundFromHeightMap, Scene, Texture } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TerrainMaterial } from "@babylonjs/materials";

import { IScript } from "babylonjs-editor-tools";

// https://doc.babylonjs.com/toolsAndResources/assetLibraries/materialsLibrary/terrainMat/
// playground https://playground.babylonjs.com/#E6OZX#7

export default class SceneComponent implements IScript {
    public constructor(public scene: Scene) {}

    public onStart(): void {
    // Create a ground from a height map   
        
       

        var terrainMaterial = new TerrainMaterial("terrainMaterial", this.scene);

        terrainMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
        terrainMaterial.specularPower = 64;

        terrainMaterial.mixTexture = new Texture("scene/assets/AssetLibrary/mixMap.png", this.scene);
        // Diffuse textures following the RGB values of the mix map
	    //  grass/ Red  rock/Green  floor: Blue
        terrainMaterial.diffuseTexture1 = new Texture("scene/assets/AssetLibrary/grass.png", this.scene);
        terrainMaterial.diffuseTexture2 = new Texture("scene/assets/AssetLibrary/rock.png", this.scene);
        terrainMaterial.diffuseTexture3 = new Texture("scene/assets/AssetLibrary/floor.png", this.scene);
        
        terrainMaterial.bumpTexture1 = new Texture("scene/assets/AssetLibrary/grassn.png", this.scene);
        terrainMaterial.bumpTexture2 = new Texture("scene/assets/AssetLibrary/rockn.png", this.scene);
        terrainMaterial.bumpTexture3 = new Texture("scene/assets/AssetLibrary/floor_bump.png", this.scene);

        terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 10;
        terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 10;
        terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 10;
        
       
        // Ground
             var ground = CreateGroundFromHeightMap("terrain","scene/assets/AssetLibrary/heightMap.png", {
                width: 20000,
                height: 20000,
                subdivisions: 100,
                minHeight: 0,
                maxHeight: 200,
                updatable: false,
                onReady: (mesh) => {
                    // Additional logic if needed
                }
            }, this.scene);
        ground.position.y = -200.0;
        ground.material = terrainMaterial;
    }
    public onUpdate(): void {
        
    }
}
