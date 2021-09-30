import { AppPlayer } from "./AppPlayer";
import { DetailPanel } from "./DetailPanel";

/**
 * 楽曲プレイヤーとアプリ詳細表示
 */
export class ControlPanel
{
    #appPlayer:AppPlayer;
    #detailPanel:DetailPanel;
    element:HTMLElement;
    constructor()
    {
        this.#appPlayer = new AppPlayer();
        this.#detailPanel = new DetailPanel();
        this.element = document.getElementById("ControlPanel");
    }
    /**
     * 見せる
     */
    show()
    {
        this.element.style.bottom = "0px";
    }
    /**
     * 隠す 
     */
    hide()
    {
        this.element.style.bottom = "-30px";
        if(this.#detailPanel.isOpen){
            this.#detailPanel.popDown();
        }
    }
    /**
     * 更新
     * @param seekTime シーク時間
     * @param isPlaying 再生中か
     */
    update(seekTime:number, isPlaying:boolean)
    {
        this.#appPlayer.update(seekTime, isPlaying);
    }
    /**
     * VideoReadyになったときの処理
     */
    onVideoReady()
    {
        this.#detailPanel.onVideoReady();
    }
}