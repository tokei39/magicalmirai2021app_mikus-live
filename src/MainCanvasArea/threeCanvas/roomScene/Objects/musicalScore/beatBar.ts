import * as THREE from "three";
import { TextAliveWrapper } from "../../../../../textAliveWrapper";
import { RoomParam, SceneObjects } from "../../roomScene"
class BeatBar
{
    beatBarMesh:THREE.Mesh;
    index:number;
    beatTime:number;
    x:number;
    y:number;
    constructor(beatBarGeometry:THREE.BoxBufferGeometry, beatBarMaterial:THREE.MeshPhongMaterial)
    {
        this.beatBarMesh = new THREE.Mesh(beatBarGeometry, beatBarMaterial);
    }
    setPos(x:number, y:number)
    {
        if(x!=null){
            this.beatBarMesh.position.x = x;
        }
        if(y!=null){
            this.beatBarMesh.position.y = y;
        }
    }
    sceneAdd(scene:THREE.Object3D, beatTime:number, beatIndex:number)
    {
        this.beatTime = beatTime;
        this.index = beatIndex;
        scene.add(this.beatBarMesh);
    }
    sceneRemove(scene:THREE.Object3D)
    {
        scene.remove(this.beatBarMesh);
    }
}

export class BeatBarManager
{
    #beatBarGeometry:THREE.BoxBufferGeometry;
    #beatBarMaterial:THREE.MeshPhongMaterial;
    #unUseBeatBars:BeatBar[] = [];
    #useBeatBars:BeatBar[] = [];

    constructor()
    {
        const beatBarWidth =  0.05;
        this.#beatBarGeometry = new THREE.BoxBufferGeometry(RoomParam.scoreSizeX, beatBarWidth, beatBarWidth);
        this.#beatBarMaterial = new THREE.MeshPhongMaterial({side: THREE.FrontSide});
        this.#beatBarMaterial.color.setColorName("black");
        for(let i=0; i<100; i++){
            const beatBar = new BeatBar(this.#beatBarGeometry, this.#beatBarMaterial);
            this.#unUseBeatBars.push(beatBar);
        }
    }

    update(seekTime:number)
    {
        const scoreStartTime = seekTime;
        let scoreEndTime = seekTime + RoomParam.scoreTime;
        if(scoreEndTime>TextAliveWrapper.data.songTime){
            scoreEndTime = TextAliveWrapper.data.songTime;
        }
        const scoreSpeed = RoomParam.scoreSpeed;
        const scoreMoveObject = SceneObjects.scoreMoveObject;

        const allBeatInfo = TextAliveWrapper.data.allBeatInfo;
        if(!allBeatInfo) return;
        const scoreStartBeat = allBeatInfo.getBeatBySeekTime(scoreStartTime);
        const scoreEndBeat = allBeatInfo.getBeatBySeekTime(scoreEndTime);
        const uses = this.#useBeatBars;
        const unUses = this.#unUseBeatBars;

        /* 譜面から抜けるビート、曲切替時の存在しないビートを削除 */
        const removeIndexes:number[] = [];
        uses.forEach(beatBar => {
            if(beatBar.index<scoreStartBeat.index || scoreEndBeat.index < beatBar.index){
                removeIndexes.push(beatBar.index);
            }
        });
        if(removeIndexes.length>0){
            //console.log(removeIndexes); /* 曲データの設定用にログ出す */
        }
        removeIndexes.forEach(beatBarIndex => {
            const arrayIndex = uses.findIndex(beatBar =>
                beatBar.index == beatBarIndex
            )
            uses[arrayIndex].sceneRemove(scoreMoveObject);
            unUses.push(uses[arrayIndex]);
            uses.splice(arrayIndex,1);
        })

        /* 譜面に来たビートを追加 */
        for(let index=scoreStartBeat.index;index<=scoreEndBeat.index;index++){
            const findIndex = uses.findIndex(beatBar =>
                beatBar.index == index
            );
            if(findIndex==-1){
                const beatBar = unUses.pop();
                const beat = allBeatInfo.getBeatByIndex(index);
                beatBar.setPos(RoomParam.scoreSizeX/2, (beat.time.start/1000)*scoreSpeed);
                beatBar.sceneAdd(scoreMoveObject, beat.time.start, beat.index);
                uses.push(beatBar);
            }
        }
    }
    resetVideoData()
    {
        while(this.#useBeatBars.length>0){
            const beatBar =this.#useBeatBars.pop(); 
            beatBar.sceneRemove(SceneObjects.scoreMoveObject);
            this.#unUseBeatBars.push(beatBar)
        }
    }
}
