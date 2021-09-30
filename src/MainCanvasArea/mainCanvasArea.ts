import { LoadingCanvas } from "./loadingCanvas";
import { ThreeCanvas } from "./threeCanvas/threeCanvas";

/**
 * 画面のメイン表示
 */
export class MainCanvasArea
{
    isThreeCanvas:boolean = false;

    #element:HTMLElement;
    #loadingCanvas:LoadingCanvas;
    #threeCanvas:ThreeCanvas;
    #width:number;
    #height:number;

    constructor()
    {
        this.#loadingCanvas = new LoadingCanvas();
        this.#element = document.getElementById("MainCanvasArea");
        this.#element.appendChild(this.#loadingCanvas.canvas);

        this.#threeCanvas = new ThreeCanvas();
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update(seekTime:number)
    {
        /* モデルの読み込みが終わったらThreeCanvasに切り替える */
        if(!this.isThreeCanvas){
            if(this.#threeCanvas.checkModelLoad()){
                this.#element.replaceChild(this.#threeCanvas.canvas, this.#loadingCanvas.canvas);
                this.isThreeCanvas = true;
            }
        }

        const isSizeUpdated = this.#isSizeUpdated();
        if(isSizeUpdated){
            this.#loadingCanvas.updateSize(this.#width, this.#height);
            this.#threeCanvas.updateSize(this.#width, this.#height);
        }
        if(!this.isThreeCanvas){
            /* モデルロード中はLoadingCanvas表示 */
            const progress = this.#threeCanvas.ModelLoadProgress;
            if(progress.error){
                this.#loadingCanvas.update(progress.progress, progress.error);
            }else{
                this.#loadingCanvas.update(progress.progress);
            }
        }else{
            this.#threeCanvas.update(seekTime);
        }
    }
    /**
     * ロード状況表示設定
     * @param nowStatus 現在のロード状況
     * @param completeStatus ロード状況全体
     */
    setSongLoadStatus(nowStatus:number, completeStatus:number)
    {
        this.#threeCanvas.setSongLoadStatus(nowStatus, completeStatus);
    }
    /**
     * VideoReadyになったときの処理
     */
    onVideoReady ()
    {
        this.#threeCanvas.onVideoReady();
    }
    /**
     * VideoReadyがリセットされたときの処理
     */
    resetVideoReady()
    {
        this.#threeCanvas.resetVideoReady();
    }
    /**
     * TimerReadyになったときの処理
     */
    onTimerReady()
    {
        this.#threeCanvas.onTimerReady();
    }
    /**
     * サイズがアップデートされた確認
     * @returns アップデートされたか
     */
    #isSizeUpdated()
    {
        const element = this.#element;
        const width = element.offsetWidth;
        const height  = element.offsetHeight;
        if(width != this.#width || height != this.#height) {
            this.#width = width;
            this.#height = height;
            return true;
        }else{
            return false;
        }
    }
}
