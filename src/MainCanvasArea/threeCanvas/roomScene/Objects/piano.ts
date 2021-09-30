import * as THREE from "three";
import { RoomParam, SceneObjects } from "../roomScene";
import { GlobalKeyDefine } from "../../../../global";
import { ChordInfo, TextAliveWrapper } from "../../../../textAliveWrapper";

/**
 * ピアノ
 */
export class Piano
{
    keys:PianoKey[][] = [];
    #preChordInfo:ChordInfo;
    #pianoKeyBase:PianoKeyBase;
    /**
     * @param scene シーン
     */
    constructor(scene:THREE.Scene)
    {
        this.#pianoKeyBase = new PianoKeyBase();
        SceneObjects.pianoPositionObject = new THREE.Object3D();
        SceneObjects.pianoPositionObject.position.x = -(RoomParam.pianoOctaveSizeX/2);
        SceneObjects.pianoPositionObject.position.y = -(RoomParam.roomSizeY/2);
        SceneObjects.pianoPositionObject.position.z = -(RoomParam.roomSizeZ/2);
        scene.add(SceneObjects.pianoPositionObject);

        this.keys.push(this.#makePianoKeyOctave(0));

        for(let i=1; i<=RoomParam.pianoOctaveSideNum; i++)
        {
            this.keys.push(this.#makePianoKeyOctave(i));
        }
        for(let i=-1; i>=-RoomParam.pianoOctaveSideNum; i--)
        {
            this.keys.push(this.#makePianoKeyOctave(i));
        }
    }
    /**
     * 1オクターブ分のオブジェクトのクラスを作成する
     * @param octave オクターブの場所
     * @returns 作成したクラスの配列
     */
    #makePianoKeyOctave(octave:number)
    {
        const base = this.#pianoKeyBase;
        const keys:PianoKey[] = [];

        for(let i=0;i<GlobalKeyDefine.keyMapSharp.length;i++){
            const isWhite  = GlobalKeyDefine.whiteKey.findIndex(whiteKey => (
                whiteKey == GlobalKeyDefine.keyMapSharp[i]
            ))
            if(isWhite == -1){
                keys.push(new PianoBlackKey(base, i, octave));
            }else{
                keys.push(new PianoWhiteKey(base, i, octave));
            }
        }
        return keys;
    }
    /**
     * VideoReadyになったときの処理
     */
    onVideoReady()
    {
        /* 何もしない */
    }
    /**
     * VideoReadyがリセットされたときの処理
     */
    resetVideoReady()
    {
        /* 初期化 */
        this.keys.forEach(octave => {
            octave.forEach(key => {
                key.restoreTexture();
            })
        })

    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update(seekTime:number)
    {
        /* データが取得できなかったらそのままreturn */
        const allChordInfo = TextAliveWrapper.data.allChordInfo;
        if(!allChordInfo) return;

        /* コード情報取得 */
        let nowChordInfoName, preChordInfoName
        if(this.#preChordInfo){
            preChordInfoName = this.#preChordInfo.name;
        }else{
            preChordInfoName = "";
        }
        const nowChordInfo = allChordInfo.chordInfos.find(chordInfo =>
            chordInfo.startTime < seekTime && seekTime <= chordInfo.endTime
        );
        if(nowChordInfo){
            nowChordInfoName = nowChordInfo.name
        }else{
            nowChordInfoName = "";
        }

        /* コードが変わった場合 */
        if(nowChordInfoName != preChordInfoName){
            /* 前の表示を削除 */
            if(this.#preChordInfo && this.#preChordInfo.chordKey){
                this.#preChordInfo.chordKey.forEach(keyIndex => {
                    this.keys[0][keyIndex].restoreTexture();
                })
            }
            /* 次の表示 */
            if(nowChordInfo && nowChordInfo.chordKey){
                nowChordInfo.chordKey.forEach(keyIndex => {
                    this.keys[0][keyIndex].changeTexture();
                })
            }
            this.#preChordInfo = nowChordInfo;
        }

        /* 表示更新 */
        if(nowChordInfo && nowChordInfo.chordKey){
            nowChordInfo.chordKey.forEach(keyIndex => {
                this.keys[0][keyIndex].updateTexture(seekTime, nowChordInfo.startTime, nowChordInfo.endTime);
            })
        }
    }
}

/**
 * ピアノキーの共通オブジェクト
 */
class PianoKeyBase
{
    whiteBarMaterial:THREE.MeshPhongMaterial;
    blackBarMaterial:THREE.MeshPhongMaterial;
    whiteBarChangingMaterial:THREE.MeshPhongMaterial;
    blackBarChangingMaterial:THREE.MeshPhongMaterial;

    whiteLowerBarGeometry:THREE.BoxBufferGeometry;
    whiteUpperBarGeometry:THREE.BoxBufferGeometry;
    blackBarGeometry:THREE.BoxBufferGeometry;

    constructor()
    {
        this.whiteBarMaterial = new THREE.MeshPhongMaterial({side: THREE.FrontSide});
        this.whiteBarMaterial.color.setColorName("white");
        this.blackBarMaterial = new THREE.MeshPhongMaterial({side: THREE.FrontSide});
        this.blackBarMaterial.color.setColorName("black");

        this.whiteBarChangingMaterial = new THREE.MeshPhongMaterial({
            side: THREE.FrontSide,
            emissive: 0x0000FF
        });
        this.blackBarChangingMaterial = new THREE.MeshPhongMaterial({
            side: THREE.FrontSide,
            emissive: 0x0000FF
        });

        this.whiteLowerBarGeometry = new THREE.BoxBufferGeometry(RoomParam.pianoLowerBarSizeX,
                                                                RoomParam.pianoWhiteBarSizeY,
                                                                RoomParam.pianoLowerBarSizeZ);
        this.whiteUpperBarGeometry = new THREE.BoxBufferGeometry(RoomParam.pianoUpperBarSizeX,
                                                                RoomParam.pianoWhiteBarSizeY,
                                                                RoomParam.pianoUpperBarSizeZ);
        this.blackBarGeometry = new THREE.BoxBufferGeometry(RoomParam.pianoUpperBarSizeX,
                                                                RoomParam.pianoBlackBarSizeY,
                                                                RoomParam.pianoUpperBarSizeZ);
    }
}

/**
 * ピアノキーの継承元クラス
 */
class PianoKey
{
    base:PianoKeyBase;
    meshes:THREE.Mesh[];
    keyIndex:number;
    octave:number;
    /**
     * @param pianoKeyBase ピアノキーの共通オブジェクト
     * @param keyIndex オクターブ中の順番
     * @param octave オクターブの位置
     */
    constructor(pianoKeyBase:PianoKeyBase, keyIndex:number, octave:number)
    {
        this.base=pianoKeyBase;
        this.keyIndex = keyIndex;
        this.meshes = new Array();
        this.octave = octave;
    }
    /**
     * テクスチャを更新するmaterialに変更
     */
    changeTexture()
    {
    }
    /**
     * materialの更新
     * @param seekTime シーク時間(ms)
     * @param chordStartTime コードの開始時間
     * @param chordEndTime コードの終了時間
     */
    updateTexture(seekTime:number, chordStartTime:number, chordEndTime:number)
    {
    }
    /**
     * テクスチャをもとのmaterialに復元
     */
    restoreTexture()
    {
    }
}

/**
 * 白鍵
 */
class PianoWhiteKey extends PianoKey
{
    constructor(pianoKeyBase:PianoKeyBase, keyIndex:number, octave:number)
    {
        super(pianoKeyBase, keyIndex, octave);

        const lowerMesh = new THREE.Mesh(this.base.whiteLowerBarGeometry, this.base.whiteBarMaterial);
        const lowerKeyIndex = GlobalKeyDefine.whiteKey.findIndex(whiteKey => (
            whiteKey == GlobalKeyDefine.keyMapSharp[keyIndex]
        ))
        lowerMesh.position.x = ((RoomParam.pianoOctaveSizeX/RoomParam.pianoOctaveWhiteKeyNum) * (lowerKeyIndex + 0.5))
                                + (RoomParam.pianoOctaveSizeX * octave);
        lowerMesh.position.y = RoomParam.pianoWhiteBarSizeY/2;
        lowerMesh.position.z = RoomParam.pianoUpperBarSizeZ + (RoomParam.pianoLowerBarSizeZ/2);
        this.meshes.push(lowerMesh)
        SceneObjects.pianoPositionObject.add(lowerMesh);

        const upperMesh = new THREE.Mesh(this.base.whiteUpperBarGeometry, this.base.whiteBarMaterial);
        upperMesh.position.x = (RoomParam.pianoOctaveSizeX/RoomParam.pianoOctaveKeyNum) * (keyIndex + 0.5)
                                + (RoomParam.pianoOctaveSizeX * octave);
        upperMesh.position.y = RoomParam.pianoWhiteBarSizeY/2;
        upperMesh.position.z = RoomParam.pianoUpperBarSizeZ/2;
        this.meshes.push(upperMesh)
        SceneObjects.pianoPositionObject.add(upperMesh);
    }
    changeTexture()
    {
        const base = this.base;
        this.meshes.forEach(mesh => {
            mesh.material = base.whiteBarChangingMaterial;
        })
    }
    updateTexture(seekTime:number, chordStartTime:number, chordEndTime:number)
    {
        const material = this.base.whiteBarChangingMaterial;
        //material.color.setColorName("blue");
    }
    restoreTexture()
    {
        const base = this.base;
        this.meshes.forEach(mesh => {
            mesh.material = base.whiteBarMaterial;
        })
    }
}

/**
 * 黒鍵
 */
class PianoBlackKey extends PianoKey
{
    constructor(base:PianoKeyBase, keyIndex:number, octave:number)
    {
        super(base, keyIndex, octave);

        const upperMesh = new THREE.Mesh(this.base.blackBarGeometry, this.base.blackBarMaterial);
        upperMesh.position.x = (RoomParam.pianoOctaveSizeX/RoomParam.pianoOctaveKeyNum) * (keyIndex + 0.5)
                                + (RoomParam.pianoOctaveSizeX * octave);
        upperMesh.position.y = RoomParam.pianoBlackBarSizeY/2;
        upperMesh.position.z = RoomParam.pianoUpperBarSizeZ/2;

        this.meshes.push(upperMesh)
        SceneObjects.pianoPositionObject.add(upperMesh);
    }
    changeTexture()
    {
        const base = this.base;
        this.meshes.forEach(mesh => {
            mesh.material = base.blackBarChangingMaterial;
        })
    }
    updateTexture(seekTime:number, chordStartTime:number, chordEndTime:number)
    {
        const material = this.base.blackBarChangingMaterial;
        //material.color.setColorName("red");
    }
    restoreTexture()
    {
        const base = this.base;
        this.meshes.forEach(mesh => {
            mesh.material = base.blackBarMaterial;
        })
    }
}
