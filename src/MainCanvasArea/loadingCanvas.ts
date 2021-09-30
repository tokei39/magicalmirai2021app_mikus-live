/**
 * Three.jsのモデルがロードされるまで表示するキャンバス
 */
export class LoadingCanvas
{
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;

    constructor()
    {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "loadingCanvas"
        const ctx = this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 1000;
        this.canvas.height = 500;
    }
    /**
     * 更新
     * @param progressEvent Three.jsのモデルのロード状況
     */
    update(progressEvent:ProgressEvent, errorEvent?:ErrorEvent)
    {
        const canvas = this.canvas;
        const ctx = this.ctx;

        const message:string[] = [];
        const errorMessage:string[] = [];
        message.push("Miku's Live");
        message.push("Model loading...");
        if(progressEvent){
            const progress = Math.round(progressEvent.loaded / progressEvent.total * 100);
            message.push("(" + progress + "%)");
        }
        if(errorEvent){
            errorMessage.push(errorEvent.message);
            errorMessage.push("初音ミクのモデル(miku.glb)の読み込みに失敗しました。")
        }
        //console.log(message);
        ctx.font = "50px 'MS Pゴシック'";
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i=0;i<message.length;i++){
            ctx.fillText(message[i], canvas.width*1/2, canvas.height*(i+1)/(message.length+errorMessage.length+1), canvas.width);
        }
        ctx.fillStyle = "red";
        for(let i=0;i<errorMessage.length;i++){
            ctx.fillText(errorMessage[i], canvas.width*1/2, canvas.height*(message.length+i+1)/(message.length+errorMessage.length+1), canvas.width);
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
        canvas.height = canvas.width*(height/width);
    }
}