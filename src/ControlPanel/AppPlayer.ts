import { TextAliveWrapper } from "../textAliveWrapper";

/**
 * 楽曲のプレイヤー
 */
export class AppPlayer
{
    element:HTMLElement;
    #playPauseCanvas:PlayPauseCanvas;
    #seekTimeCanvas:SeekTimeCanvas;
    #seekBarCanvas:SeekBarCanvas;
    #width:number;
    #height:number;
    constructor()
    {
        this.element = document.getElementById("AppPlayer");

        this.#playPauseCanvas = new PlayPauseCanvas(this.element);
        this.#seekTimeCanvas = new SeekTimeCanvas(this.element);
        this.#seekBarCanvas = new SeekBarCanvas(this.element);
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     * @param isPlaying 再生中か
     */
    update(seekTime:number, isPlaying:boolean)
    {
        const isSizeUpdated = this.#checkSizeUpdate();
        this.#playPauseCanvas.update(isPlaying,isSizeUpdated);
        this.#seekTimeCanvas.update(seekTime, isSizeUpdated);
        this.#seekBarCanvas.update(seekTime, isSizeUpdated);
    }
    /**
     * 画面サイズ更新の確認
     * @returns 更新されたか
     */
    #checkSizeUpdate()
    {
        const width = this.element.offsetWidth;
        const height  = this.element.offsetHeight;
        if(width != this.#width || height != this.#height) {
            this.#width = width;
            this.#height = height;
            return true;
        }else{
            return false;
        }
    }
}

/**
 * キャンバスサイズの定義
 */
class CanvasSize
{
    static playPauseCanvasWidthPx:number = 30;
    static seekTimeCanvasWidthPx:number = 100;
}

/**
 * 再生/一時停止のキャンバス
 */
class PlayPauseCanvas
{
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    #isPlaying:boolean;
    /**
     * @param parentElement キャンバスの親エレメント
     */
    constructor(parentElement:HTMLElement)
    {
        const canvas = this.canvas = document.createElement("canvas");
        canvas.id = "PlayPauseCanvas"
        canvas.style.width = CanvasSize.playPauseCanvasWidthPx + "px";
        canvas.style.height = "100%";
        canvas.style.left = "0px";
        canvas.style.position = "absolute";
        canvas.style.cursor = "pointer";

        this.ctx = this.canvas.getContext('2d');
        parentElement.appendChild(this.canvas);
        this.#drawPlay();

        this.canvas.addEventListener("click", () => this.onClick());
    }
    /**
     * クリックイベントのハンドラ
     */
    onClick()
    {
        if(this.#isPlaying){
            /* 一時停止要求 */
            TextAliveWrapper.requestPause();
        }else{
            /* 再生要求 */
            TextAliveWrapper.requestPlay();
        }
    }
    /**
     * 再生ステータスの設定
     * @param isPlayingNow 再生中か
     * @param isSizeChanged サイズが変更されたか
     */
    update(isPlayingNow:boolean, isSizeChanged:boolean)
    {
        if(isSizeChanged){
            /* ここのサイズは変更しない */
        }
        if(this.#isPlaying && (!isPlayingNow)){ /* 一時停止中なので再生マーク描画 */
            this.#drawPlay();
            this.#isPlaying = false;
        }else if((!this.#isPlaying) && isPlayingNow){ /* 再生中なので一時停止マーク描画 */
            this.#drawPause();
            this.#isPlaying = true;
        }
    }
    /**
     * 再生マークの描画
     */
    #drawPlay()
    {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const dSize = Math.min(canvas.width, canvas.height) /2;
        const spaceX = (canvas.width - dSize)/2;
        const spaceY = (canvas.height - dSize)/2;

        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle="red";
        ctx.beginPath();
        ctx.moveTo(spaceX, spaceY);
        ctx.lineTo(spaceX, spaceY+dSize);
        ctx.lineTo(spaceX+dSize, canvas.height/2)
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
    /**
     * 一時停止マークの描画
     */
    #drawPause()
    {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const dSize = Math.min(canvas.width, canvas.height) /2;
        const spaceX = (canvas.width - dSize)/2;
        const spaceY = (canvas.height - dSize)/2;

        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.moveTo(spaceX, spaceY);
        ctx.lineTo(spaceX, spaceY+dSize);
        ctx.lineTo(spaceX+(dSize/3), spaceY+dSize);
        ctx.lineTo(spaceX+(dSize/3), spaceY);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(spaceX+(dSize*2/3), spaceY);
        ctx.lineTo(spaceX+(dSize*2/3), spaceY+dSize);
        ctx.lineTo(spaceX+dSize, spaceY+dSize);
        ctx.lineTo(spaceX+dSize, spaceY);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
}
/**
 * シーク時間のキャンバス
 */
class SeekTimeCanvas
{
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    #songTime:number = 0;
    /**
     * @param parentElement キャンバスの親エレメント
     */
    constructor(parentElement:HTMLElement)
    {
        const canvas = this.canvas = document.createElement("canvas");
        canvas.id = "SeekTimeCanvas"
        canvas.style.width = CanvasSize.seekTimeCanvasWidthPx + "px";
        canvas.style.height = "100%";
        canvas.style.left = CanvasSize.playPauseCanvasWidthPx + "px";
        canvas.style.position = "absolute";

        const ctx = this.ctx = canvas.getContext('2d');
        ctx.font = "48px 'MS Pゴシック'";
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        parentElement.appendChild(canvas);

        this.update(0, false);
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     * @param isSizeChanged サイズが変更されたか
     */
    update(seekTime:number, isSizeChanged:boolean)
    {
        const canvas = this.canvas;
        const ctx = this.ctx;
        if(isSizeChanged){
            /* ここのサイズは変更しない */
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const seekTimeStr = this.#getTimeStr(seekTime);
        ctx.fillText(seekTimeStr, canvas.width*1/4, canvas.height/2, canvas.width/2);

        ctx.fillText("/", canvas.width*2/4, canvas.height/2, canvas.width/2);

        this.#songTime = TextAliveWrapper.data.songTime;
        const songTimeStr = this.#getTimeStr(this.#songTime);
        ctx.fillText(songTimeStr, canvas.width*3/4, canvas.height/2, canvas.width/2);

    }
    /**
     * 時間の数字を文字列にする
     * @param time 時間(ms)
     * @returns 変換後の文字列
     */
    #getTimeStr(time:number)
    {
        const timeSecond = Math.floor(time)/1000;
        const timeStr = String(Math.floor(timeSecond/60)) + ":" + String(Math.floor(timeSecond%60));
        return timeStr;
    }
}
/**
 * シークバーのキャンバス
 */
class SeekBarCanvas
{
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    #songTime:number = 0;
    #startX:number;
    #endX:number;
    #parentElement:HTMLElement;
    /**
     * @param parentElement キャンバスの親エレメント
     */
    constructor(parentElement:HTMLElement)
    {
        const canvas = this.canvas = document.createElement("canvas");
        canvas.id = "SeekBarCanvas"
        const widthPx = parentElement.offsetWidth - CanvasSize.playPauseCanvasWidthPx - CanvasSize.seekTimeCanvasWidthPx;
        const leftPx = CanvasSize.playPauseCanvasWidthPx + CanvasSize.seekTimeCanvasWidthPx;
        this.#parentElement = parentElement;

        canvas.style.width = widthPx + "px";
        canvas.style.height = "100%";
        canvas.style.cursor = "pointer";
        canvas.style.left = leftPx + "px";
        canvas.style.position = "absolute";
        this.ctx = this.canvas.getContext('2d');
        parentElement.appendChild(this.canvas);

        this.canvas.addEventListener("click", (eve) => this.onClick(eve));
        this.update(0, false);
    }
    /**
     * クリックイベントのハンドラ
     * @param eve クリックイベント
     */
    onClick(eve:MouseEvent)
    {
        this.#songTime = TextAliveWrapper.data.songTime;
        if(this.#songTime != 0){
            let clickSeekX = eve.offsetX;
            if(clickSeekX<this.#startX){
                clickSeekX = this.#startX;
            }else if(this.#endX<clickSeekX){
                clickSeekX = this.#endX;
            }
            const clickSeekRate = (clickSeekX-this.#startX) / (this.#endX - this.#startX);
            const clickSeekTime = clickSeekRate * this.#songTime;
            //console.log("seek to " + clickSeekTime/1000 + ", ALL:" + this.#songTime/1000);
            TextAliveWrapper.requestMediaSeek(clickSeekTime);
        }
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     * @param isSizeChanged サイズが変更されたか
     */
    update(seekTime:number, isSizeChanged:boolean)
    {
        const canvas = this.canvas;
        const ctx = this.ctx;

        if(isSizeChanged){
            const widthPx = this.#parentElement.offsetWidth - CanvasSize.playPauseCanvasWidthPx - CanvasSize.seekTimeCanvasWidthPx;
            canvas.style.width = widthPx + "px";
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        const startX = this.#startX = 10;
        const endX = this.#endX = canvas.width-10;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.moveTo(startX, canvas.height/2);
        ctx.lineTo(endX, canvas.height/2);
        ctx.stroke();

        let seekX;
        this.#songTime = TextAliveWrapper.data.songTime;
        if(this.#songTime == 0){
            seekX = startX;
        }else{
            seekX = startX + ((seekTime/this.#songTime) * (endX - startX))
        }
        ctx.fillStyle = "darkblue";
        ctx.beginPath();
        ctx.arc(seekX, canvas.height/2, canvas.height/4, 0, 2*Math.PI, false);
        ctx.fill();
    }
}