import * as THREE from "three";
import { RoomParam, SceneObjects } from "../../roomScene";
import { ChordInfo, TextAliveWrapper } from "../../../../../textAliveWrapper";

class ChordBar
{
    chordInfo:ChordInfo;
    length:number;
    sceneAdded:boolean;

    #geometry:THREE.BoxBufferGeometry;
    #material:THREE.MeshPhongMaterial;
    #lightMaterial:THREE.MeshPhongMaterial;
    #meshes:THREE.Mesh[] = [];
    constructor(chordInfo:ChordInfo, startY:number, length:number)
    {
        this.chordInfo = chordInfo;
        if(chordInfo.name=="N") return;
        const chordBarWidth =  1.0;
        this.#geometry = new THREE.BoxBufferGeometry(RoomParam.scoreBarSpace, length, chordBarWidth);
        this.#material = new THREE.MeshPhongMaterial({
            side: THREE.FrontSide,
            color: 0x0000FF,
        });
        this.#lightMaterial = new THREE.MeshPhongMaterial({
            side: THREE.FrontSide,
            emissive: 0x0000FF,
            emissiveIntensity: 0.5
        });

        this.length = length;
        this.sceneAdded=false;

        this.chordInfo.chordKey.forEach(keyPos =>{
            const chordBarMesh =  new THREE.Mesh(this.#geometry, this.#material);
            chordBarMesh.position.x = (keyPos * RoomParam.scoreBarSpace) + (RoomParam.scoreBarSpace/2);
            chordBarMesh.position.y = startY;
            chordBarMesh.position.z = chordBarWidth/2;
            this.#meshes.push(chordBarMesh);
        },this)
    }
    changeTexture()
    {
        this.#meshes.forEach(mesh => {
            mesh.material = this.#lightMaterial;
        })
    }
    restoreTexture()
    {
        this.#meshes.forEach(mesh => {
            mesh.material = this.#material;
        })
    }
    updatePrint(progress:number)
    {
        if(this.chordInfo.name=="N") return;
        this.#material.emissiveIntensity = 1 + progress;
    }

    sceneAdd(scene:THREE.Object3D)
    {
        this.#meshes.forEach(mesh => {
            scene.add(mesh);
        });
        this.sceneAdded = true;
    }
    sceneRemove(scene:THREE.Object3D)
    {
        this.#meshes.forEach(mesh => {
            scene.remove(mesh);
        });
        this.sceneAdded = false;
    }
    move(x:number, y:number, z:number)
    {
        this.#meshes.forEach(chordBarMesh =>{
            if(x) chordBarMesh.position.x=x;
            if(y) chordBarMesh.position.y=y;
            if(z) chordBarMesh.position.z=z;
        })
    }
    close(scene:THREE.Object3D)
    {
        if(this.sceneAdded==true){
            this.#meshes.forEach(chordBarMesh =>{
                scene.remove(chordBarMesh);
            })
        }
        if(this.#geometry){
            this.#geometry.dispose();
        }
        if(this.#material){
            this.#material.dispose();
        }
    }
}

export class ChordBarManager
{
    chordBars:ChordBar[] = [];
    preChordBar:ChordBar = null;

    constructor()
    {
    }

    resetVideoData()
    {
        /* リセット */
        this.chordBars.forEach(chordBar => {
            chordBar.close(SceneObjects.scoreMoveObject);
        })
        this.chordBars = [];

    }
    setVideoData()
    {
        const scoreSpeed = RoomParam.scoreSpeed;
        const chordInfos = TextAliveWrapper.data.allChordInfo.chordInfos;
        chordInfos.forEach(chordInfo => {
            const startPosY = (chordInfo.startTime/1000)*scoreSpeed;
            const endPosY = (chordInfo.endTime/1000)*scoreSpeed
            const length = endPosY-startPosY;
            const posCenterY = startPosY+(length/2);
            const chordBar = new ChordBar(chordInfo, posCenterY, length);
            this.chordBars.push(chordBar);
        },this);
    }

    update(seekTime:number)
    {
        const scoreStartTime = seekTime;
        const scoreEndTime = seekTime + RoomParam.scoreTime;
        const scoreMoveObject = SceneObjects.scoreMoveObject;

        /* 譜面に来たコードを追加 */
        this.chordBars.forEach(chordBar => {
            const chordInfo = chordBar.chordInfo;
            if(chordInfo.name=="N") return;
            if(scoreStartTime < chordInfo.endTime &&
                chordInfo.startTime <= scoreEndTime){
                /* 譜面中にあるコード */
                if(chordBar.sceneAdded == false){
                    chordBar.sceneAdd(scoreMoveObject);
                }
            }else{
                /* 譜面中にないコード */
                if(chordBar.sceneAdded == true){
                    chordBar.sceneRemove(scoreMoveObject);
                }
            }
        },this);
        const nowChordBar = this.chordBars.find(chordBar => 
            chordBar.chordInfo.startTime <= seekTime &&
            seekTime <= chordBar.chordInfo.endTime
        );
        if(this.preChordBar != nowChordBar){
            if(this.preChordBar){
                this.preChordBar.restoreTexture();
            }
            if(nowChordBar){
                nowChordBar.changeTexture();
            }
            this.preChordBar = nowChordBar;

        }
    }
}
