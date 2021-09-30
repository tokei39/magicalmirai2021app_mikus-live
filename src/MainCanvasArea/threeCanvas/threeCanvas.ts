import * as THREE from "three";
import { Model } from "./model";
import { RoomScene } from "./roomScene/roomScene";
import { LoadingScene } from "./loadingScene";

/**
 * Three.jsを使って表示するキャンバス
 */
export class ThreeCanvas
{
    canvas:HTMLCanvasElement;
    #model:Model;
    #renderer:THREE.Renderer;

    #roomScene:RoomScene;
    #loadingScene:LoadingScene;

    isModelReady:boolean = false;
    #isSongLoaded:boolean = false;

    #width:number;
    #height:number;

    constructor ()
    {
        this.#model = new Model();
        const canvas = this.canvas = document.createElement("canvas");
        this.canvas.id = "threeCanvas"

        /* renderの初期化 */
        const renderer = new THREE.WebGLRenderer({canvas,  antialias: true, alpha: false });
        //console.log("pixelRatio:" + window.devicePixelRatio);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.#renderer = renderer;

        /* sceneとcameraを用意 */
        this.#loadingScene = new LoadingScene(canvas.clientWidth, canvas.clientHeight, this.#model);
        this.#roomScene = new RoomScene(canvas.clientWidth, canvas.clientHeight, this.#model);
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update(seekTime:number)
    {
        if(!this.#isSongLoaded){
            this.#loadingScene.update(seekTime);
            this.#renderer.render(this.#loadingScene.scene, this.#loadingScene.camera);
        }else{
            this.#roomScene.update(seekTime);
            this.#renderer.render(this.#roomScene.scene, this.#roomScene.camera);
        }
    }
    /**
     * サイズの更新
     * @param width 幅
     * @param height 高さ
     */
    updateSize(width:number, height:number)
    {
        const canvas = this.canvas;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        this.#renderer.setSize(width, height, false);
        this.#loadingScene.resize(width, height);
        this.#roomScene.resize(width, height);
    }
    /**
     * モデルロード完了の確認
     * @returns モデルのロードが完了したか
     */
    checkModelLoad()
    {
        if(this.#model.isReady){
            this.isModelReady = true;
        }
        return this.isModelReady;
    }
    /**
     * モデルロード状況
     */
    get ModelLoadProgress()
    {
        return {
            progress:this.#model.modelData.progress, 
            error:this.#model.modelData.error
        };
    }
    /**
     * ロード画面に表示する楽曲のロード状況を更新
     * @param nowStatus 楽曲のロード状況
     * @param completeStatus 楽曲のロード完了時の状況
     */
    setSongLoadStatus(nowStatus:number, completeStatus:number)
    {
        this.#loadingScene.setSongLoadStatus(nowStatus, completeStatus);
    }
    /**
     * VideoReadyになったときの処理
     */
    onVideoReady ()
    {
        this.#roomScene.onVideoReady();
    }
    /**
     * VideoReadyがリセットされたときの処理
     */
    resetVideoReady()
    {
        this.#renderer.render(this.#loadingScene.scene, this.#loadingScene.camera);
        this.#roomScene.resetVideoReady();
        this.#isSongLoaded = false;
    }
    /**
     * TimerReadyになったときの処理
     */
    onTimerReady()
    {
        this.#isSongLoaded = true;
    }
    /**
     * サイズが更新されたか確認し、更新されていたらcanvasサイズとrender比率を再設定する
     * @returns サイズが更新されたか
     */
    #checkSizeUpdate()
    {
        const canvas = this.canvas;
        const width = canvas.parentElement.offsetWidth;
        const height  = canvas.parentElement.offsetHeight;
        if(width != this.#width || height != this.#height) {
            this.#width = width;
            this.#height = height;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            this.#renderer.setSize(width, height, false);
            return true;
        }else{
            return false;
        }
    }
}