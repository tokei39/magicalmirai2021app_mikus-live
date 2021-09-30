import * as THREE from "three";
import { BeatBarManager } from "./beatBar";
import { ChordBarManager } from "./chordBar";
import { RoomParam, SceneObjects } from "../../roomScene";

class MusicalScoreBase
{
    #barMaterial:THREE.MeshPhongMaterial;
    #horizontalBarGeometry:THREE.BoxBufferGeometry;
    #horizontalBarMeshes:THREE.Mesh[] = [];
    #verticalBarGeometry:THREE.BoxBufferGeometry;
    #verticalBarMeshes:THREE.Mesh[] = [];
    #scoreBarWidth:number = 0.05;

    constructor(scene:THREE.Scene)
    {
        SceneObjects.scorePositionObject = new THREE.Object3D();

        SceneObjects.scorePositionObject.position.x = -(RoomParam.pianoOctaveSizeX/2);
        SceneObjects.scorePositionObject.position.y = -(RoomParam.roomSizeY/2) + RoomParam.pianoBlackBarSizeY;
        SceneObjects.scorePositionObject.position.z = -(RoomParam.roomSizeZ/2);

        scene.add(SceneObjects.scorePositionObject);

        this.#initScoreBaseBar();

        SceneObjects.scoreMoveObject = new THREE.Object3D();
        SceneObjects.scorePositionObject.add(SceneObjects.scoreMoveObject);
    }

    #initScoreBaseBar()
    {
        this.#barMaterial = new THREE.MeshPhongMaterial({side: THREE.FrontSide});
        this.#barMaterial.color.setColorName("black");

        this.#verticalBarGeometry = new THREE.BoxBufferGeometry(this.#scoreBarWidth, RoomParam.scoreSizeY, this.#scoreBarWidth);
        for(let i=0; i<RoomParam.pianoOctaveKeyNum+1; i++){
            const verticalBarMesh = new THREE.Mesh(this.#verticalBarGeometry, this.#barMaterial);
            verticalBarMesh.position.x = i * (RoomParam.scoreBarSpace);
            verticalBarMesh.position.y = RoomParam.scoreSizeY/2;
            verticalBarMesh.position.z = this.#scoreBarWidth/2;
            SceneObjects.scorePositionObject.add(verticalBarMesh);
            this.#verticalBarMeshes.push(verticalBarMesh);
        }

        this.#horizontalBarGeometry = new THREE.BoxBufferGeometry(RoomParam.scoreSizeX, this.#scoreBarWidth, this.#scoreBarWidth);
        for(let i=0; i<2; i++){
            const horizontalBarMesh = new THREE.Mesh(this.#horizontalBarGeometry, this.#barMaterial);
            horizontalBarMesh.position.x = RoomParam.scoreSizeX/2;
            horizontalBarMesh.position.z = this.#scoreBarWidth/2;
            this.#horizontalBarMeshes.push(horizontalBarMesh);
            SceneObjects.scorePositionObject.add(horizontalBarMesh);
        }
        this.#horizontalBarMeshes[0].position.y = 0;
        this.#horizontalBarMeshes[1].position.y = RoomParam.scoreSizeY;
    }
}
export class MusicalScore
{
    #verticalScoreBase:MusicalScoreBase;
    #beatBarManager:BeatBarManager;
    #chordBarManager:ChordBarManager;
    constructor(scene:THREE.Scene)
    {
        this.#verticalScoreBase = new MusicalScoreBase(scene);
        this.#beatBarManager = new BeatBarManager();
        this.#chordBarManager =  new ChordBarManager();
    }
    onVideoReady()
    {
        this.#chordBarManager.setVideoData();
    }
    resetVideoReady()
    {
        this.#beatBarManager.resetVideoData();
        this.#chordBarManager.resetVideoData();
    }
    update(seekTime:number)
    {
        const scoreMoveObject = SceneObjects.scoreMoveObject;
        const scoreSpeed = RoomParam.scoreSpeed;

        this.#beatBarManager.update(seekTime);
        this.#chordBarManager.update(seekTime);

        scoreMoveObject.position.y = -(scoreSpeed*(seekTime/1000));

    }
}