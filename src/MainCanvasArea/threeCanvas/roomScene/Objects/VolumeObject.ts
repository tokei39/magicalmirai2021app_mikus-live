import * as THREE from "three";
import { TextAliveWrapper } from "../../../../textAliveWrapper";
import { RoomParam, SceneObjects } from "../roomScene";

/**
 * 音量によって高さが上下するオブジェクト
 */
export class VolumeObject
{
    #geometry:THREE.BoxBufferGeometry
    #material:THREE.MeshPhongMaterial;
    #meshes:THREE.Mesh[][] = [];
    #maxVolume:number;
    #numX:number = 5;
    #numY:number = 20;
    #volumePerMesh:number;

    #preYs:number[] = [];
    #yRates:number[] = [];
    #preUpdateObjectTime:number = 0;
    #preUpdateYRateTime:number = 0;

    #updateObjectInterval:number = 40;
    #updateYRateInterval:number = 60;
    /**
     * @param scene シーン
     */
    constructor(scene:THREE.Scene)
    {
        const numX = this.#numX;
        const numY = this.#numY;
        for(let x=0;x<numX*2;x++){
            this.#preYs.push(1);
            this.#yRates.push(1);
        }

        /* 余白含めたサイズ */
        const allWidthX = (RoomParam.roomSizeX - RoomParam.scoreSizeX)/2;
        const allWidthY = RoomParam.roomSizeY - RoomParam.pianoBlackBarSizeY;
        /* 余白含めないサイズ */
        const widthX = allWidthX*0.8;
        const widthY = allWidthY*0.8;
        /* mesh1個ずつの間隔 */
        const spaceX = 0.2;
        const spaceY = 0.1;
        /* mesh1個ずつのサイズ */
        const sizeX = widthX/numX-spaceX;
        const sizeY = widthY/numY-spaceY;
        const sizeZ = 0.5;

        SceneObjects.volumePositionObject = new THREE.Object3D();
        SceneObjects.volumePositionObject.position.x = -(RoomParam.roomSizeX/2) + (allWidthX-widthX)/2 + (sizeX/2);
        SceneObjects.volumePositionObject.position.y = -(RoomParam.roomSizeY/2) + RoomParam.pianoBlackBarSizeY + (allWidthY-widthY)/2 + (sizeY/2);
        SceneObjects.volumePositionObject.position.z = -(RoomParam.roomSizeZ/2) + sizeZ/2;
        scene.add(SceneObjects.volumePositionObject);

        this.#geometry = new THREE.BoxBufferGeometry(sizeX, sizeY, sizeZ);
        this.#material = new THREE.MeshPhongMaterial({
            side: THREE.FrontSide,
            emissive: 0x00FF00,
            emissiveIntensity: 0.5
        });
        for(let x=0;x<numX*2;x++){
            const meshesX:THREE.Mesh[] = [];
            for(let y=0;y<numY;y++){
                const mesh = new THREE.Mesh(this.#geometry, this.#material);
                if(x<numX){
                    mesh.position.x = (sizeX+spaceX)*x;
                }else{
                    mesh.position.x = RoomParam.scoreSizeX+allWidthX+(sizeX+spaceX)*(x-numX);
                }
                mesh.position.y = (sizeY+spaceY)*y;
                mesh.position.z = 0;
                /* デフォルトは1つ表示 */
                if(y==0){
                    SceneObjects.volumePositionObject.add(mesh);
                }
                meshesX.push(mesh);
            }
            this.#meshes.push(meshesX);
        }
    }
    /**
     * VideoReadyになったときの処理
     */
    onVideoReady()
    {
        /* ボリューム更新 */
        this.#maxVolume = TextAliveWrapper.data.getMaxVolume();
        this.#volumePerMesh = this.#maxVolume/this.#numY
    }
    /**
     * VideoReadyがリセットされたときの処理
     */
    resetVideoReady()
    {
        for(let xIndex=0;xIndex<this.#numX*2;xIndex++){
            this.#preYs[xIndex] = 1;
            for(let yIndex=1;yIndex<this.#numY;yIndex++){
                SceneObjects.volumePositionObject.remove(this.#meshes[xIndex][yIndex]);
            }
        }
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update(seekTime:number)
    {
        /* 更新間隔を間引く */
        if(Math.abs(seekTime-this.#preUpdateObjectTime)<this.#updateObjectInterval) return;
        this.#preUpdateObjectTime = seekTime;

        /* 時々比率を更新する */
        const yRates = this.#yRates;
        if(Math.abs(seekTime-this.#preUpdateYRateTime)>this.#updateYRateInterval){
            for(let i=0; i<yRates.length; i++){
                yRates[i] = Math.random()*1.5;
            }
            this.#preUpdateYRateTime = seekTime;
        }

        /* 更新 */
        const nowVolume = TextAliveWrapper.data.getVolume(seekTime);
        const nowYs = this.#preYs.concat();
        for(let xIndex=0;xIndex<this.#numX*2;xIndex++){
            const nextHeightBase = Math.round((nowVolume/this.#volumePerMesh)*yRates[xIndex]);
            if(nextHeightBase>nowYs[xIndex]){
                nowYs[xIndex] += 1;
            }else if(nextHeightBase<nowYs[xIndex]){
                nowYs[xIndex] -= 1;
            }
            for(let yIndex=0;yIndex<this.#numY;yIndex++){
                if(yIndex>nowYs[xIndex]){
                    SceneObjects.volumePositionObject.remove(this.#meshes[xIndex][yIndex]);
                }else{
                    SceneObjects.volumePositionObject.add(this.#meshes[xIndex][yIndex]);
                }
            }
        }
        this.#preYs = nowYs;
    }
}