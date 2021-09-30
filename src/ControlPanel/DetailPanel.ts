import { SongInfo, TextAliveWrapper } from "../textAliveWrapper";

/**
 * アプリ詳細
 */
export class DetailPanel
{
    element:HTMLElement;
    isOpen:boolean = false;

    #songNameElement:HTMLElement;
    #songArtistElement:HTMLElement;
    #lyricArtistElement:HTMLElement;
    #songURLElement:HTMLElement;

    #detailPanelOpen:DetailPanelOpen;
    constructor()
    {
        this.#detailPanelOpen = new DetailPanelOpen(this.popUpDown, this);

        this.element = document.getElementById("DetailPanel");

        this.#songNameElement = document.getElementById("songName");
        this.#songArtistElement = document.getElementById("songArtist");
        this.#lyricArtistElement = document.getElementById("lyricArtist");
        this.#songURLElement = document.getElementById("songURL");
    }
    /**
     * VideoReadyになったときの処理
     */
    onVideoReady()
    {
        const songInfo = TextAliveWrapper.data.songInfo;
        if(songInfo){
            this.#updateSongInfo(songInfo);
            this.#updateSongSelect(songInfo)
        }
    }
    /**
     * 見せる
     */
    popUp()
    {
        this.isOpen = true;
        this.element.style.opacity = "0.7";
        this.element.style.visibility = "visible";
    }
    /**
     * 隠す
     */
    popDown()
    {
        this.isOpen = false;
        this.element.style.opacity = "0";
        this.element.style.visibility = "hidden";
    }
    /**
     * 表示/非表示切り替える
     */
    popUpDown()
    {
        if(this.isOpen){
            this.popDown();
        }else{
            this.popUp();
        }
    }
    /**
     * 曲情報を更新
     * @param songInfo textalive driver から取得した曲情報
     */
    #updateSongInfo(songInfo:SongInfo)
    {
        this.#songNameElement.textContent = "曲名 : " + songInfo.songName;
        this.#songArtistElement.textContent = "作曲 : " + songInfo.songArtist;
        this.#lyricArtistElement.textContent = "作詞 : " + songInfo.lyricsArtist;
        this.#songURLElement.textContent = "URL : " + songInfo.songURL;
    }
    /**
     * 選曲radioボタンを更新
     * @param songInfo textalive driver から取得した曲情報
     */
    #updateSongSelect(songInfo:SongInfo)
    {
        const radioElement = <HTMLInputElement>document.getElementById(songInfo.songName)
        if(radioElement){
            radioElement.checked = true;
        }
    }
}

/**
 * 詳細表示を開くボタン
 */
class DetailPanelOpen
{
    #element:HTMLElement;
    #popUpDownFunc:() => void;
    #callThis:any;
    /**
     * @param detailPanelElement 開く詳細表示のエレメント
     */
    constructor(popUpDownFunc:() => void, thisArg?:any)
    {
        this.#element = document.getElementById("DetailPanelOpen");
        this.#element.addEventListener("click", () => this.onClick());
        this.#element.appendChild(document.createTextNode("option"));
        this.#popUpDownFunc = popUpDownFunc;
        if(thisArg){
            this.#callThis = thisArg;
        }else{
            this.#callThis = this;
        }
    }
    /**
     * クリックイベントのハンドラ
     */
    onClick ()
    {
        this.#popUpDownFunc.apply(this.#callThis);
    }
}
