import * as THREE from "three";
import { AllBeatInfo, BeatInfo, TextAliveWrapper } from "../../../textAliveWrapper";
import { Model } from "../model";
import { GlobalKeyDefine } from "../../../global";
import { LightData, SongDataList } from "./SongData";

import { DanceModel } from "./Objects/danceModel";
import { CharBoxManager } from "./Objects/lyricScreen";
import { MusicalScore } from "./Objects/musicalScore/musicalScore";
import { Piano } from "./Objects/piano";
import { VolumeObject } from "./Objects/VolumeObject";

/**
 * ルームシーンのパラメータ
 */
export class RoomParam
{
    /* 部屋 */
    static roomSizeX:number = 24;
    static roomSizeY:number = 15;
    static roomSizeZ:number = 40;

    /* ピアノ */
    static pianoOctaveSizeX:number = 8;
    static pianoOctaveSideNum:number = 1;
    static pianoBarSpaceWidth:number = 0.1;

    static pianoOctaveKeyNum:number = GlobalKeyDefine.keyMapSharp.length;
    static pianoOctaveWhiteKeyNum:number = GlobalKeyDefine.whiteKey.length;

    static pianoLowerBarSizeX:number;
    static pianoUpperBarSizeX:number;

    static pianoLowerBarSizeZ:number;
    static pianoUpperBarSizeZ:number;

    static pianoWhiteBarSizeY:number;
    static pianoBlackBarSizeY:number;

    /* モデル */
    static modelPosZ:number = -7;

    /* 楽譜 */
    static scoreSizeX:number = RoomParam.pianoOctaveSizeX;
    static scoreSizeY:number = RoomParam.roomSizeY;

    static scoreSpeed:number = 10;/* 1秒あたりに譜面上のThreeオブジェクトがどれだけ進むか */

    static scoreTime:number;
    static scoreBarSpace:number;

    /* 歌詞 */

    static lyricTimeAfterPhraseEnd:number = 1500;
    static lyricTimeBeforePhraseStart:number = 1500;

    constructor()
    {
        RoomParam.pianoLowerBarSizeX = (RoomParam.pianoOctaveSizeX/GlobalKeyDefine.whiteKey.length) - RoomParam.pianoBarSpaceWidth;
        RoomParam.pianoUpperBarSizeX = (RoomParam.pianoOctaveSizeX/GlobalKeyDefine.keyMapSharp.length) - RoomParam.pianoBarSpaceWidth;

        RoomParam.pianoLowerBarSizeZ = RoomParam.roomSizeZ * 0.25;
        RoomParam.pianoUpperBarSizeZ = RoomParam.pianoLowerBarSizeZ * 0.8;

        RoomParam.pianoWhiteBarSizeY = RoomParam.pianoLowerBarSizeX;
        RoomParam.pianoBlackBarSizeY = RoomParam.pianoLowerBarSizeX + RoomParam.pianoUpperBarSizeX;

        RoomParam.scoreTime = (RoomParam.scoreSizeY/RoomParam.scoreSpeed) * 1000;
        RoomParam.scoreBarSpace = RoomParam.scoreSizeX / GlobalKeyDefine.keyMapSharp.length
    }
}

/**
 * ルームシーンのオブジェクト配置先
 */
export class SceneObjects
{
    static lyricPositionObject:THREE.Object3D;
    static scorePositionObject:THREE.Object3D;
    static scoreMoveObject:THREE.Object3D;
    static pianoPositionObject:THREE.Object3D;
    static volumePositionObject:THREE.Object3D;
}

/**
 * ステージを表示するシーン
 */
export class RoomScene
{
    #lyricScreen:CharBoxManager;
    #musicalScore:MusicalScore;
    #roomSceneThree:RoomSceneThree;
    #piano:Piano;
    #model:Model;
    #danceModel:DanceModel;
    #volumeObject:VolumeObject;
    #songDataList:SongDataList;
    /**
     * @param width 画面の幅
     * @param height 画面の高さ
     * @param model モデル
     */
    constructor(width:number, height:number, model:Model)
    {
        /* パラメータ初期化 */
        new RoomParam();
        this.#model = model;

        /* 曲ごとに設定したデータ読み込み */
        this.#songDataList = new SongDataList();

        /* シーンのベースを作成 */
        this.#roomSceneThree = new RoomSceneThree(width, height, this.#songDataList);

        /* シーンにオブジェクト追加 */
        this.#piano = new Piano(this.scene);
        this.#lyricScreen = new CharBoxManager(this.scene);
        this.#musicalScore = new MusicalScore(this.scene);
        this.#volumeObject = new VolumeObject(this.scene);
        this.#danceModel = new DanceModel(this.scene, model, this.#songDataList);
    }
    /**
     * シーン
     */
    get scene()
    {
        return this.#roomSceneThree.scene;
    }
    /**
     * カメラ
     */
    get camera()
    {
        return this.#roomSceneThree.camera;
    }
    /**
     * VideoReadyがリセットされたときの処理
     */
    resetVideoReady()
    {
        this.#piano.resetVideoReady();
        this.#lyricScreen.resetVideoReady();
        this.#musicalScore.resetVideoReady();
        this.#volumeObject.resetVideoReady();
    }
    /**
     * VideoReadyになったときの処理
     */
    onVideoReady ()
    {
        const songName = TextAliveWrapper.data.songInfo.songName
        this.#songDataList.setSong(songName);

        this.#piano.onVideoReady();
        this.#lyricScreen.onVideoReady();
        this.#musicalScore.onVideoReady();
        this.#volumeObject.onVideoReady();
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update (seekTime:number)
    {
        this.#roomSceneThree.update(seekTime);
        this.#danceModel.update(seekTime);
        this.#piano.update(seekTime);
        this.#lyricScreen.update(seekTime);
        this.#musicalScore.update(seekTime);
        this.#volumeObject.update(seekTime);
    }
    /**
     * 画面サイズの更新
     * @param width 画面の幅
     * @param height 画面の高さ
     */
    resize (width:number, height:number)
    {
        this.#roomSceneThree.resize(width, height);
    }
}

/**
 * シーンの実体
 */
class RoomSceneThree
{
    scene:THREE.Scene;
    camera:THREE.PerspectiveCamera;
    lights:THREE.Light[];
    roomBuilding:RoomBuilding;
    songDataList:SongDataList;
    /**
     * @param width 画面の幅
     * @param height 画面の高さ
     * @param songDataList 楽曲に設定したデータのリスト
     */
    constructor(width:number, height:number, songDataList:SongDataList)
    {
        this.scene = this.#initScene();
        this.camera = this.#initCamera(width, height);
        this.lights = this.#initLight(this.scene);
        this.roomBuilding = new RoomBuilding(this.scene);
        this.songDataList = songDataList;
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update(seekTime:number)
    {
        this.#updateCamera(this.camera, seekTime);
        this.#updateLight(this.lights, seekTime);
    }
    /**
     * 画面サイズの更新
     * @param width 画面の幅
     * @param height 画面の高さ
     */
    resize (width:number, height:number)
    {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    /**
     * シーンの初期化
     * @returns シーン
     */
    #initScene()
    {
        const scene = new THREE.Scene();

        const col   = 0xeeeeee;
        scene.background = new THREE.Color(col);
        return scene;
    }
    /**
     * カメラの初期化
     * @returns カメラ
     */
    #initCamera(width:number, height:number)
    {
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);

        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = RoomParam.roomSizeZ/2;
        camera.lookAt(0, 0, -RoomParam.roomSizeZ/2);
        camera.up.set(0, 1, 0);
        return camera;
    }
    /**
     * カメラの更新
     * @param camera カメラ
     * @param seekTime シーク時間(ms)
     */
    #updateCamera(camera:THREE.PerspectiveCamera, seekTime:number)
    {
        /* カメラ更新 */
        camera.position.x = (seekTime/500)%(RoomParam.roomSizeX*0.8) - ((RoomParam.roomSizeX*0.8)/2);
        camera.lookAt(0, 0, -RoomParam.roomSizeZ/2);
    }
    /**
     * ライトの初期化
     * @param scene シーン
     * @returns ライト
     */
    #initLight(scene:THREE.Scene)
    {
        const lights = [];

        const light = new THREE.PointLight(0xFFFFFF,1,50);
        light.position.set(0,0,10);
        scene.add(light);
        lights.push(light);

        return lights;
    }
    /**
     * ライトの更新
     * @param lights ライト
     * @param seekTime シーク時間(ms)
     */
    #updateLight(lights:THREE.Light[], seekTime:number)
    {
        /* ビート情報取得 */
        const allBeatInfo = TextAliveWrapper.data.allBeatInfo;
        const beat = allBeatInfo.getBeatBySeekTime(seekTime);
        let preBeat:BeatInfo;
        if(beat.index!=-1){
            preBeat = allBeatInfo.getBeatByIndex(beat.index-1);
        }else{
            preBeat = null;
        }

        /* 設定するライトデータ取得 */
        const lightData = this.songDataList.nowSongData.lightData;
        const nowDevLight = lightData.find(devLight =>
            devLight.beat.start <= beat.index &&
            beat.index <= devLight.beat.end
        )

        const progress = (seekTime - beat.time.start) / (beat.time.end - beat.time.start);


        if(progress < 0.5){
            /* 一つ前のライトデータからグラデーションする */
            let preDevLight:LightData;
            if(preBeat){
                preDevLight = lightData.find(devLight =>
                    devLight.beat.start <= preBeat.index &&
                    preBeat.index <= devLight.beat.end
                )
            }else{
                preDevLight = lightData[0];
            }
            lights.forEach(light => {
                light.intensity = nowDevLight.lightIntensity.min + (preDevLight.lightIntensity.max-nowDevLight.lightIntensity.min) * ((0.5-progress)*2);
            });
        }else{
            lights.forEach(light => {
                light.intensity = nowDevLight.lightIntensity.min + (nowDevLight.lightIntensity.max-nowDevLight.lightIntensity.min) * ((progress-0.5)*2);
            });
        }

    }
}

/**
 * 部屋の壁・天井・床
 */
class RoomBuilding
{
    /* 壁 */
    wallMaterial:THREE.MeshPhongMaterial;
    wallGeometry:THREE.BoxBufferGeometry;
    wallMeshes:THREE.Mesh[] = [];

    /* 天井 */
    ceilingMaterial:THREE.MeshPhongMaterial;
    ceilingGeometry:THREE.BoxBufferGeometry;
    ceilingMesh:THREE.Mesh;

    /* 床 */
    floorMaterial:THREE.MeshPhongMaterial;
    floorGeometry:THREE.BoxBufferGeometry;
    floorMesh:THREE.Mesh;

    /* 背景 */
    backgroundMaterial:THREE.MeshPhongMaterial;
    backgroundGeometry:THREE.BoxBufferGeometry;
    backgroundMesh:THREE.Mesh;

    /* 手前側壁 一応作る */
    foregroundMaterial:THREE.MeshPhongMaterial;
    foregroundGeometry:THREE.BoxBufferGeometry;
    foregroundMesh:THREE.Mesh;

    wallWidth:number = 1;

    /**
     * @param scene シーン
     */
    constructor(scene:THREE.Scene)
    {
        this.wallMaterial = new THREE.MeshPhongMaterial({side: THREE.FrontSide});
        this.wallMaterial.color.setColorName("black");
        this.wallGeometry = new THREE.BoxBufferGeometry(this.wallWidth, RoomParam.roomSizeY, RoomParam.roomSizeZ);

        for(let i=0; i<2; i++){
            const wallMesh = new THREE.Mesh(this.wallGeometry, this.wallMaterial);
            if(i==0){
                wallMesh.position.x = -(RoomParam.roomSizeX/2) - (this.wallWidth/2);
            }else{
                wallMesh.position.x = +(RoomParam.roomSizeX/2) + (this.wallWidth/2);
            }
            wallMesh.position.y = 0;
            wallMesh.position.z = 0;
            this.wallMeshes.push(wallMesh);
            scene.add(wallMesh);
        }

        this.ceilingMaterial = new THREE.MeshPhongMaterial({side: THREE.FrontSide});
        this.ceilingMaterial.color.setColorName("black");
        this.ceilingGeometry = new THREE.BoxBufferGeometry(RoomParam.roomSizeX, this.wallWidth, RoomParam.roomSizeZ);
        const ceilingMesh = this.ceilingMesh = new THREE.Mesh(this.ceilingGeometry, this.ceilingMaterial);
        ceilingMesh.position.x = 0;
        ceilingMesh.position.y = (RoomParam.roomSizeY/2) + this.wallWidth/2;
        ceilingMesh.position.z = 0;
        scene.add(ceilingMesh);

        this.floorMaterial = new THREE.MeshPhongMaterial({side: THREE.FrontSide});
        this.floorMaterial.color.setColorName("black");
        this.floorGeometry = new THREE.BoxBufferGeometry(RoomParam.roomSizeX, this.wallWidth, RoomParam.roomSizeZ);
        const floorMesh = this.floorMesh = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
        floorMesh.position.x = 0;
        floorMesh.position.y = - (RoomParam.roomSizeY/2) - (this.wallWidth/2);
        floorMesh.position.z = 0;
        scene.add(floorMesh);

        this.backgroundMaterial = new THREE.MeshPhongMaterial({
            side: THREE.FrontSide,
            color: 0x999BBB
        });
        this.backgroundGeometry = new THREE.BoxBufferGeometry(RoomParam.roomSizeX, RoomParam.roomSizeY, this.wallWidth);
        const backgroundMesh = this.backgroundMesh = new THREE.Mesh(this.backgroundGeometry, this.backgroundMaterial);
        backgroundMesh.position.x = 0;
        backgroundMesh.position.y = 0;
        backgroundMesh.position.z = 0 - (RoomParam.roomSizeZ/2) - (this.wallWidth/2);
        scene.add(backgroundMesh);

        this.foregroundMaterial = new THREE.MeshPhongMaterial({side: THREE.FrontSide});
        this.foregroundMaterial.color.setColorName("black");
        this.foregroundGeometry = new THREE.BoxBufferGeometry(RoomParam.roomSizeX, this.wallWidth, RoomParam.roomSizeZ);
        const foregroundMesh = this.foregroundMesh = new THREE.Mesh(this.foregroundGeometry, this.foregroundMaterial);
        foregroundMesh.position.x = 0;
        foregroundMesh.position.y = - (RoomParam.roomSizeY/2) - (this.wallWidth/2);
        foregroundMesh.position.z = 0;
        scene.add(foregroundMesh);
    }
}