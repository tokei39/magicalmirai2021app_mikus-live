import { TextAliveWrapper } from "./textAliveWrapper";
import { ControlPanel } from "./ControlPanel/ControlPanel";
import { MainCanvasArea } from "./MainCanvasArea/mainCanvasArea";
import { AppParameter } from "./appParameter";
/**
 * 
 * Miku's Live
 * MagicalMirai2021 プログラミングコンテスト 応募作品
 * 
 */

/**
 * Script全体を制御するメインクラス
 */
class Main
{
    #textaliveWrapper:TextAliveWrapper;
    #mainCanvasArea:MainCanvasArea;
    #controlPanel:ControlPanel;
    #appParameter:AppParameter;

    #preStatus:number;
    #seekTime:number = 0;

    constructor ()
    {
        /* 戻るボタンによるキャッシュ対策 */
        window.onbeforeunload = (() => {});
        window.onunload = (() => {});

        /* 初期化 */
        this.#textaliveWrapper = new TextAliveWrapper();
        this.#mainCanvasArea = new MainCanvasArea();
        this.#controlPanel = new ControlPanel();
        this.#appParameter = new AppParameter();
        this.#preStatus = this.#textaliveWrapper.dispatcher.loadStatusDefine.noData;

        /* ループ初回実行 */
        this.#updateLoop();
    }

    /**
     * requestAnimationFrameでループ実行
     */
    #updateLoop()
    {
        const dispatcher = this.#textaliveWrapper.dispatcher;
        const sDefine = dispatcher.loadStatusDefine;
        const status = dispatcher.loadStatus;
        const data = TextAliveWrapper.data;
        const isPlaying = data.isPlaying;
        const songTime = data.songTime;
        const seekTime = data.nowSeekTime;
        let preStatus = this.#preStatus;

        /* 曲変更されていた場合の処理 */
        if(dispatcher.songChanged){
            preStatus = this.#preStatus = sDefine.appReady;
            this.#mainCanvasArea.resetVideoReady();
            this.#controlPanel.hide();
        }

        /* 曲ロード中の処理 */
        if(preStatus != sDefine.completeLoad){
            /* ロード状況更新 */
            if(preStatus != status){
                this.#mainCanvasArea.setSongLoadStatus(status, sDefine.completeLoad);
            }
            /* VideoReadyになったとき */
            if(preStatus < sDefine.videoReady && sDefine.videoReady <= status){
                this.#mainCanvasArea.onVideoReady();
                this.#controlPanel.onVideoReady();
            }
            /* TimerReadyになったとき */
            if(preStatus<sDefine.timerReady && status>=sDefine.timerReady){
                this.#mainCanvasArea.onTimerReady();
                this.#controlPanel.show();
            }
        }

        /* シーク時間更新 */
        if(status != sDefine.completeLoad){ /* ロード中 */
            this.#seekTime = 0;
        }else if(isPlaying && seekTime <= songTime){ /* 再生中 */
            this.#seekTime = seekTime;
        }else{ /* 停止中 */
            const seekedTime = this.#textaliveWrapper.dispatcher.seekedTime;
            if (seekedTime){ /* シーク操作されてた場合 */
                this.#textaliveWrapper.dispatcher.seekedTime = null; /* 排他制御したほうがいい */
                this.#seekTime = seekedTime;
            }else{
                /* シーク時間更新なし */
            }
        }

        /* シーク時間に応じたアップデート */
        this.#mainCanvasArea.update(this.#seekTime);
        this.#controlPanel.update(this.#seekTime, isPlaying);

        /* 次の呼び出しに向けた処理 */
        this.#preStatus = status;
        window.requestAnimationFrame(() => this.#updateLoop());
    }
}

/* Main実行 */
new Main()
