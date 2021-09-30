import * as THREE from "three";
import { AllBeatInfo, TextAliveWrapper } from "../../../../textAliveWrapper";
import { ActionData, SongDataList } from "../SongData";
import { Model } from "../../model";
import { RoomParam } from "../roomScene";

/**
 * ダンスモデル
 */
export class DanceModel
{
    model:Model;
    #scene:THREE.Scene;
    #songDataList:SongDataList;
    #preDevAction: ActionData;
    #preBeatActionTime: ActionCycleTime;

    /* まばたき */
    #preBlinkSeekTime:number = 0;
    #blinkSeekTime:number = 3000;
    #blinkDuration:number = 200; /* 瞬き時間 単位:msec */

    /**
     * @param scene シーン
     * @param model モデル
     * @param songDataList 曲データのリスト
     */
    constructor(scene:THREE.Scene, model:Model, songDataList:SongDataList){
        this.model = model;
        this.#scene = scene;
        this.#songDataList = songDataList;
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update(seekTime:number){
        const model = this.model;
        const allBeatInfo = TextAliveWrapper.data.allBeatInfo;
        const actionData = this.#songDataList.nowSongData.actionData;

        /* シーン切り替わり直後の初期設定 */
        if(model.nowScene != this.#scene){
            this.#preDevAction = null;
            model.modelObject.rotation.x = 0;
            model.modelObject.rotation.y = 0;
            model.modelObject.rotation.z = 0;
            model.modelObject.position.x = 0;
            model.modelObject.position.y = -3;
            model.modelObject.position.z = RoomParam.modelPosZ
            model.setModelScene(this.#scene);
        }

        /* 現在のアクションの情報を取得 */
        const nowBeat = allBeatInfo.getBeatBySeekTime(seekTime);
        const beatProgress = (seekTime - nowBeat.time.start) / (nowBeat.time.end - nowBeat.time.start);
        const beatProgressIndex = nowBeat.index + beatProgress;
        const nowDevAction = actionData.find(devAction =>
            devAction.beat.start <= beatProgressIndex &&
            beatProgressIndex < devAction.beat.end
        );

        /* アクションが切り替わっていたら設定 */
        if(nowDevAction!=this.#preDevAction){
            if(!this.#preDevAction ||
                nowDevAction.action != this.#preDevAction.action){
                //console.log("switch action");
                //console.log(nowDevAction)
                model.setClip(nowDevAction.action);
            }
        }

        /* アクションの更新を計算 */
        const nowBeatActionTime = this.#getActionLength(allBeatInfo, beatProgressIndex, nowDevAction);
        if(!this.#preBeatActionTime ||
            this.#preBeatActionTime.start != nowBeatActionTime.start ||
            !this.#preDevAction ||
            nowDevAction.action != this.#preDevAction.action){
            //console.log(nowBeatActionTime);
            model.setActionDuration(nowBeatActionTime.end - nowBeatActionTime.start);
        }

        /* アクション更新 */
        model.updateByAbsoluteTime(seekTime-nowBeatActionTime.start);
        this.#preDevAction = nowDevAction;
        this.#preBeatActionTime = nowBeatActionTime;

        /* ランダム時間でまばたきを入れる */
        if(this.#blinkSeekTime < seekTime &&
            seekTime < this.#blinkSeekTime + this.#blinkDuration){
            const progress = (seekTime - this.#blinkSeekTime)/this.#blinkDuration
            model.setMorphVal("blinkEye", 1-(Math.abs(progress-0.5)*2));
        }else{
            model.setMorphVal("blinkEye", 0);
            if(this.#blinkSeekTime + this.#blinkDuration <= seekTime ||
                seekTime < this.#preBlinkSeekTime
            ){
                /* まばたき時間リセット */
                this.#preBlinkSeekTime = seekTime;
                this.#blinkSeekTime = this.#preBlinkSeekTime + (Math.random() * 6 * 1000);
            }
        }
    }
    /**
     * 指定したビートのときの1周分のアクションの時間を求める
     * @param allBeatInfo 音楽地図情報
     * @param beatProgressIndex ビートのindex
     * @param nowDevAction アクション情報
     * @returns 1周分のアクションの時間
     */
    #getActionLength(allBeatInfo:AllBeatInfo, beatProgressIndex:number, nowDevAction:ActionData)
    {
        const ret:ActionCycleTime = {start:0, end:0};
        let nowActionLength = 0;
        /* 現在のアクションの開始終了ビート */
        const beatFromActionStart = beatProgressIndex - nowDevAction.beat.start;
        const nowActionStartBeat = nowDevAction.beat.start + (Math.floor(beatFromActionStart/nowDevAction.actionBeats)*nowDevAction.actionBeats);
        const nowActionEndBeat = nowActionStartBeat + nowDevAction.actionBeats;

        let startBeat = allBeatInfo.getBeatByIndex(Math.floor(nowActionStartBeat));
        if(!startBeat){ /* とりあえず適当に取る */
            startBeat = allBeatInfo.getBeatByIndex(-1);
        }
        const beatStartTime = startBeat.time;
        ret.start = beatStartTime.start + (beatStartTime.end - beatStartTime.start)*(nowActionStartBeat-Math.floor(nowActionStartBeat));
        /* 開始~整数部分 */
        if((nowActionStartBeat%1)!=0){
            if(Math.floor(nowActionStartBeat) != Math.floor(nowActionEndBeat)){
                const duration = Math.ceil(nowActionStartBeat)-nowActionStartBeat;
                nowActionLength += (beatStartTime.end - beatStartTime.start) * duration;
            }else{
                const duration = nowActionEndBeat-nowActionStartBeat;
                nowActionLength += (beatStartTime.end - beatStartTime.start) * duration;
                ret.end = ret.start + nowActionLength;
                return ret;
            }
        }
        /* 整数部分 */
        for(let i=Math.ceil(nowActionStartBeat); i<Math.floor(nowActionEndBeat); i++){
            const tmpBeat = allBeatInfo.getBeatByIndex(i);
            if(tmpBeat){ /* 曲の終了超えてアクションがはみ出る場合に対処 */
                const tmpBeatLength = tmpBeat.time.end - tmpBeat.time.start;
                nowActionLength += tmpBeatLength;
            }else{
                const tmpBeat = startBeat;
                const tmpBeatLength = tmpBeat.time.end - tmpBeat.time.start;
                nowActionLength += tmpBeatLength;
            }
        }
        /* 整数~終了部分 */
        if((nowActionEndBeat%1)!=0){
            const tmpBeat = allBeatInfo.getBeatByIndex(Math.floor(nowActionEndBeat));
            const duration = nowActionEndBeat-Math.floor(nowActionEndBeat);
            if(tmpBeat){ /* 曲の終了超えてアクションがはみ出る場合に対処 */
                nowActionLength += (tmpBeat.time.end - tmpBeat.time.start) * duration;
            }else{
                const tmpBeat = startBeat;
                nowActionLength += (tmpBeat.time.end - tmpBeat.time.start) * duration;
            }
        }
        ret.end = ret.start + nowActionLength;
        return ret;
    }
}
/**
 * 1周分のアクションの時間
 * @param start 開始
 * @param end 終了
 */
interface ActionCycleTime{
    start:number,
    end:number
}