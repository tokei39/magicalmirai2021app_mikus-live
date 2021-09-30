import * as THREE from "three";
import { RoomParam, SceneObjects } from "../roomScene";
import { Ease } from "textalive-app-api";
import { LyricCharInfo, LyricPhraseInfo, TextAliveWrapper } from "../../../../textAliveWrapper";
import { AppParameter } from "../../../../appParameter";

/**
 * 歌詞
 */
export class CharBoxManager
{
    #PhraseCharBoxes:PhraseCharBox[] = [];

    /**
     * @param scene シーン
     */
    constructor(scene:THREE.Scene)
    {
        SceneObjects.lyricPositionObject = new THREE.Object3D();
        SceneObjects.lyricPositionObject.position.x = 0;
        SceneObjects.lyricPositionObject.position.y = 0;
        SceneObjects.lyricPositionObject.position.z = RoomParam.modelPosZ + (RoomParam.roomSizeZ*0.1);
        scene.add(SceneObjects.lyricPositionObject);
    }
    /**
     * VideoReadyになったときの処理
     */
    onVideoReady()
    {
        const phraseInfos = TextAliveWrapper.data.lyricInfo.phraseInfos;

        const boxes = this.#PhraseCharBoxes;
        const order = [0,3,1,4,2];
        phraseInfos.forEach(function(phraseInfo, index:number){
            boxes.push(new PhraseCharBox(phraseInfo, order[index%5]))
        },this);
    }
    /**
     * VideoReadyがリセットされたときの処理
     */
    resetVideoReady()
    {
        this.#PhraseCharBoxes.forEach(lyricPhraseBox => {
            lyricPhraseBox.close();
        })
        this.#PhraseCharBoxes = [];
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update(seekTime:number)
    {
        /* 箱の追加と削除 */
        this.#PhraseCharBoxes.forEach(lyricPhraseBox => {
            if(lyricPhraseBox.sceneStartTime <= seekTime &&
                seekTime < lyricPhraseBox.sceneEndTime){
                lyricPhraseBox.update(seekTime);
            }else if(lyricPhraseBox.sceneAdded){
                lyricPhraseBox.sceneRemove();
            }
        });
    }
}

/**
 * フレーズでまとめたCharBox
 */
class PhraseCharBox
{
    phraseInfo:LyricPhraseInfo
    #lyricCharBoxes:CharBox[] = [];
    moveObject:THREE.Object3D;
    sceneStartTime:number;
    sceneEndTime:number;
    sceneAdded:boolean;
    charOther:string[] = ["!","！","?","？","(","（",")","）","「","」",]

    /**
     * @param phraseInfo フレーズ情報
     * @param geometry ジオメトリ
     * @param laneIndex 表示するレーンのインデックス
     */
    constructor(phraseInfo:LyricPhraseInfo, laneIndex:number)
    {
        this.phraseInfo = phraseInfo;
        this.moveObject = new THREE.Object3D();
        this.sceneAdded=false;
        this.sceneStartTime = this.phraseInfo.startTime - RoomParam.lyricTimeBeforePhraseStart;
        this.sceneEndTime = this.phraseInfo.endTime + RoomParam.lyricTimeAfterPhraseEnd;
        this.moveObject.position.y = laneIndex;
        SceneObjects.lyricPositionObject.add(this.moveObject);
        let enChars:LyricCharInfo[];
        for(let i=0;i<phraseInfo.charInfos.length;i++){
            const charInfo = phraseInfo.charInfos[i];
            let box:CharBox;
            const otherIndex = this.charOther.findIndex(char =>
                char == charInfo.text
            );
            if(otherIndex>-1){
                box = new CharOtherBox(charInfo, this.moveObject);
                this.#lyricCharBoxes.push(box);
            }else if(charInfo.lang == "ja"){
                box = new CharJABox(charInfo, this.moveObject);
                this.#lyricCharBoxes.push(box);
            }else if(charInfo.lang == "en"){
                if(enChars==undefined){
                    enChars = new Array();
                }
                enChars.push(charInfo);
                if(charInfo.isWordEnd){
                    box = new CharENBox(enChars, this.moveObject);
                    this.#lyricCharBoxes.push(box);
                    enChars = undefined;
                }
            }else{ /* 日本語として扱う */
                box = new CharJABox(charInfo, this.moveObject);
                this.#lyricCharBoxes.push(box);
            }
        }
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update(seekTime:number)
    {
        /* 箱の追加と削除 */
        if(!this.sceneAdded){ /* 楽譜に入った箱のシーン追加 */
            let posX = 0;
            this.sceneAdded = true;
            for(let i=0;i<this.#lyricCharBoxes.length;i++){
                this.#lyricCharBoxes[i].sceneAdd(posX,0,0);
                if(i!=this.#lyricCharBoxes.length-1){
                    posX += this.#lyricCharBoxes[i].width/2 + this.#lyricCharBoxes[i+1].width/2;
                }
            }
        }
        this.#lyricCharBoxes.forEach(lyricCharBox => {
            lyricCharBox.update(seekTime);
        });

        const duration = this.phraseInfo.endTime - this.phraseInfo.startTime;
        const boxNum = this.#lyricCharBoxes.length;
        const progress = (seekTime - this.phraseInfo.startTime)/duration;
        this.moveObject.position.x = -boxNum*progress;
    }
    /**
     * シーンからの除去
     */
    sceneRemove()
    {
        this.#lyricCharBoxes.forEach(lyricCharBox => {
            lyricCharBox.sceneRemove();
        });
        this.sceneAdded = false;
    }
    /**
     * クラス削除前の除去
     */
    close()
    {
        this.#lyricCharBoxes.forEach(lyricCharBox => {
            lyricCharBox.close();
        })
        SceneObjects.lyricPositionObject.remove(this.moveObject);
    }
}

export interface LyricColor
{
    name:string,
    frameColor:string,
    backColor:string,
    backChangeColor:string,
    charColor:string
}
/**
 * 歌詞を表示する箱
 * 日本語だと1文字、英語だと1単語格納する
 */
class CharBox
{
    defPosition = {x:0, y:0, z:0}
    width:number;
    text:string = "";
    color:LyricColor;
    printProgress:number;
    startTime:number;
    endTime:number;

    geometry:THREE.BoxBufferGeometry;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    texture:THREE.Texture;
    material:THREE.MeshPhongMaterial;
    mesh:THREE.Mesh;
    scene:THREE.Object3D;
    /**
     * @param charInfo 文字情報
     * @param geometry ジオメトリ
     * @param scene シーン
     */
    constructor (scene:THREE.Object3D)
    {
        this.scene = scene;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
    }
    /**
     * クラス削除前の除去
     */
    close()
    {
        this.sceneRemove();
        if(this.material){
            this.material.dispose();
        }
    }
    /**
     * シーンへの追加
     * @param x x座標
     * @param y y座標
     * @param z z座標
     */
    sceneAdd(x:number, y:number, z:number)
    {
        this.defPosition.x = this.mesh.position.x = x;
        this.defPosition.y = this.mesh.position.y = y;
        this.defPosition.z = this.mesh.position.z = z;
        this.scene.add(this.mesh);
    }
    /**
     * シーンからの削除
     */
    sceneRemove()
    {
        this.scene.remove(this.mesh);
    }
    /**
     * 表示の更新
     * @param progress 進捗
     */
    #printUpdate(progress:number)
    {
        const cv = this.canvas;
        const ctx = this.ctx;
        const color = this.color;
        ctx.fillStyle = color.frameColor;
        ctx.fillRect(0, 0, cv.width, cv.height);

        const area = {x:{start:8,width:cv.width-16},y:{start:8,width:cv.height-16}};
        ctx.fillStyle = color.backColor;
        ctx.fillRect(area.x.start, area.y.start, area.x.width, area.y.width);

        ctx.beginPath();
        ctx.arc(cv.width/2, cv.height/2, area.x.width/2 * Ease.circOut(progress), 0, Math.PI*2);
        ctx.closePath();
        ctx.fillStyle = color.backChangeColor;
        ctx.fill();

        const fontSize = cv.height/2;

        ctx.fillStyle = color.charColor;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = "bold " + fontSize + "px sans-serif";
        ctx.fillText(this.text, cv.width/2, cv.height/2)

        // テクスチャの更新
        this.texture.needsUpdate = true;
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update (seekTime:number)
    {
        const beforeTime = RoomParam.lyricTimeBeforePhraseStart;
        const afterTime = RoomParam.lyricTimeAfterPhraseEnd;
        const charStartTime = this.startTime;
        const charEndTime = this.endTime;
        let printProgress = 0;
        if(seekTime < charStartTime - beforeTime){ /* 表示前 */
            this.mesh.position.x = -100;
            printProgress = 0;
        }else if(seekTime < charStartTime){ /* 再生前 */
            const prog = 1-(charStartTime - seekTime)/beforeTime;
            const posX =  (RoomParam.roomSizeX/2) + (RoomParam.roomSizeX/2) * -(Ease.quintOut(prog));
            this.mesh.position.x = this.defPosition.x + posX;
            printProgress = 0;
        }else if(charStartTime <= seekTime &&
            seekTime <= charEndTime){ /* 再生中 */
            const prog = (seekTime - charStartTime)/(charEndTime - charStartTime);
            printProgress = prog;
            this.mesh.position.x = this.defPosition.x + 0;
        }else if(charEndTime < seekTime &&
            seekTime <= charEndTime + afterTime){ /* 再生後 */
            printProgress = 1;
            const prog = (seekTime - charEndTime)/afterTime;
            const posX = (RoomParam.roomSizeX/2) * -(Ease.quintIn(prog));
            this.mesh.position.x = this.defPosition.x + posX;
        }else{ /* 表示後 */
            this.mesh.position.x = -100;
        }
        this.#printUpdate(printProgress);
    }
}
class CharJABox extends CharBox
{
    charJAInfo:LyricCharInfo;
    constructor(charJAInfo:LyricCharInfo, scene:THREE.Object3D)
    {
        super(scene);
        this.width = 1;
        this.geometry = new THREE.BoxBufferGeometry(this.width,1,1);
        this.charJAInfo = charJAInfo
        this.canvas.width = 256;
        this.canvas.height = 256;
        this.texture = new THREE.Texture(this.canvas);
        this.material = new THREE.MeshPhongMaterial({ map: this.texture, transparent: true, alphaTest: 0.0, side: THREE.FrontSide});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.text = charJAInfo.text;
        this.startTime = this.charJAInfo.startTime;
        this.endTime = this.charJAInfo.endTime;
    }
    update (seekTime:number)
    {
        switch(this.charJAInfo.pos){
            case "N": /* 名詞 */
                this.color = AppParameter.colorParams.find(color =>
                    color.name == "日本語名詞"
                )
                break;
            default:
                this.color = AppParameter.colorParams.find(color =>
                    color.name == "日本語その他"
                )
                break;
        }
        super.update(seekTime);
    }
}
class CharENBox extends CharBox
{
    charENInfo:LyricCharInfo[];
    constructor(charENInfo:LyricCharInfo[], scene:THREE.Object3D)
    {
        super(scene);
        const widthX = this.width = charENInfo.length/2;
        charENInfo.forEach(char => {
            this.text = this.text + char.text;
        })
        this.geometry = new THREE.BoxBufferGeometry(widthX,1,1);
        this.charENInfo = charENInfo
        this.canvas.width = 256*widthX;
        this.canvas.height = 256;
        this.texture = new THREE.Texture(this.canvas);
        this.material = new THREE.MeshPhongMaterial({ map: this.texture, transparent: true, alphaTest: 0.0, side: THREE.FrontSide});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        const firstChar = this.charENInfo[0];
        const lastChar = this.charENInfo[this.charENInfo.length-1]
        this.startTime = firstChar.startTime;
        this.endTime = lastChar.endTime;
    }
    update (seekTime:number)
    {
        this.color = AppParameter.colorParams.find(color =>
            color.name == "英語"
        )
        super.update(seekTime);
    }
}
class CharOtherBox extends CharBox
{
    charOtherInfo:LyricCharInfo;
    constructor(charOtherInfo:LyricCharInfo, scene:THREE.Object3D)
    {
        super(scene);
        this.width = 0.5;
        this.text = charOtherInfo.text;
        this.geometry = new THREE.BoxBufferGeometry(this.width,1,1);
        this.charOtherInfo = charOtherInfo
        this.canvas.width = 256 * this.width;
        this.canvas.height = 256;
        this.texture = new THREE.Texture(this.canvas);
        this.material = new THREE.MeshPhongMaterial({ map: this.texture, transparent: true, alphaTest: 0.0, side: THREE.FrontSide});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.startTime = this.charOtherInfo.startTime;
        this.endTime = this.charOtherInfo.endTime;
    }
    update (seekTime:number)
    {
        this.color = AppParameter.colorParams.find(color =>
            color.name == "記号"
        )
        super.update(seekTime);
    }
}
