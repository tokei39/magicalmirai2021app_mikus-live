import * as textaliveAppApi from "textalive-app-api";
import { LyricColor } from "./MainCanvasArea/threeCanvas/roomScene/Objects/lyricScreen";
import { songParam, TextAliveWrapper } from "./textAliveWrapper";

/**
 * マジカルミライ2021プログラミングコンテスト 楽曲指定
 */
export interface RegisteredSongInfo {
    name:string,
    defaultURL:string,
    piaproURL:string,
    YouTubeURL:string,
    beatId:number,
    repetitiveSegmentId:number,
    lyricId:number,
    lyricDiffId:number,
}
export class AppParameter
{
    /* YouTubeとpiaproでビートタイミングが違う曲がある
      defaultURLでだけ判定する */
    static MagicalMirai2021Songs:RegisteredSongInfo[]= [
        {
            //blues / First Note
            name:"First Note",
            defaultURL:"https://piapro.jp/t/FDb1/20210213190029",
            piaproURL:"https://piapro.jp/t/FDb1/20210213190029",
            YouTubeURL:null,
            // 音楽地図訂正履歴: https://songle.jp/songs/2121525/history
            beatId: 3953882,
            repetitiveSegmentId: 2099561,
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FFDb1%2F20210213190029
            lyricId: 52065,
            lyricDiffId: 5093,
        },
        {
            //chiquewa / Freedom!
            name:"Freedom!",
            defaultURL: "https://piapro.jp/t/N--x/20210204215604",
            piaproURL: "https://piapro.jp/t/N--x/20210204215604",
            YouTubeURL: "https://www.youtube.com/watch?v=pAaD4Hta0ns",
            // 音楽地図訂正履歴: https://songle.jp/songs/2121403/history
            beatId: 3953761,
            repetitiveSegmentId: 2099586,
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FN--x%2F20210204215604
            lyricId: 52094,
            lyricDiffId: 5171,
        },
        {
            //"ラテルネ / その心に灯る色は",
            name:"その心に灯る色は",
            defaultURL: "https://www.youtube.com/watch?v=bMtYf3R0zhY",
            piaproURL: "https://piapro.jp/t/FLj2/20210222225003",
            YouTubeURL:"https://www.youtube.com/watch?v=bMtYf3R0zhY",
            // 音楽地図訂正履歴: https://songle.jp/songs/2121404/history
            beatId: 3953902,
            repetitiveSegmentId: 2099660,
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/www.youtube.com%2Fwatch%3Fv=bMtYf3R0zhY
            lyricId: 52093,
            lyricDiffId: 5177,
        },
        {
            //真島ゆろ / 嘘も本当も君だから
            name:"嘘も本当も君だから",
            defaultURL:"https://piapro.jp/t/YW_d/20210206123357",
            piaproURL:"https://piapro.jp/t/YW_d/20210206123357",
            YouTubeURL: "https://www.youtube.com/watch?v=Se89rQPp5tk",
            // 音楽地図訂正履歴: https://songle.jp/songs/2121405/history
            beatId: 3953908,
            repetitiveSegmentId: 2099661,
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FYW_d%2F20210206123357
            lyricId: 52061,
            lyricDiffId: 5123,
        },
        {
            //シロクマ消しゴム / 夏をなぞって
            name:"夏をなぞって",
            defaultURL:"https://piapro.jp/t/R6EN/20210222075543",
            piaproURL:"https://piapro.jp/t/R6EN/20210222075543",
            YouTubeURL: "https://www.youtube.com/watch?v=3wbZUkPxHEg",
            // 音楽地図訂正履歴: https://songle.jp/songs/2121406/history
            beatId: 3953764,
            repetitiveSegmentId: 2099662,
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FR6EN%2F20210222075543
            lyricId: 52062,
            lyricDiffId: 5133,
        },
        {
            //濁茶 / 密かなる交信曲
            name:"密かなる交信曲",
            defaultURL:"https://www.youtube.com/watch?v=Ch4RQPG1Tmo",
            piaproURL:null, //"https://piapro.jp/t/CAj5"
            YouTubeURL:"https://www.youtube.com/watch?v=Ch4RQPG1Tmo",
            // 音楽地図訂正履歴: https://songle.jp/songs/2121407/history
            beatId: 3953917,
            repetitiveSegmentId: 2099665,
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/www.youtube.com%2Fwatch%3Fv=Ch4RQPG1Tmo
            lyricId: 52063,
            lyricDiffId: 5149,
        },
    ];
    static colorParams:LyricColor[] = [
        {name:"日本語名詞", frameColor:"#000000",backColor:"#0000FF",backChangeColor:"#00FF50",charColor:"#0000FF"},
        {name:"日本語その他", frameColor:"#000000",backColor:"#FFFFFF",backChangeColor:"#00FF50",charColor:"#000000"},
        {name:"英語", frameColor:"#000000",backColor:"#C000FF",backChangeColor:"#00FF50",charColor:"#C000FF"},
        {name:"記号", frameColor:"#000000",backColor:"#00FF50",backChangeColor:"#00FF50",charColor:"#000000"},
    ];
    static songParam:songParam = {
        url:"",
        lyricId:undefined,
        lyricDiffId:undefined,
        chordId:undefined,
        beatId:undefined,
        repetitiveSegmentId:undefined
    }

    constructor()
    {
        this.#initColorParam();
        this.#initSongParam();
    }
    #initColorParam()
    {
        const table= <HTMLTableElement>document.getElementById("paramColorTable");
        const buttonElement = document.getElementById("RequestColorButton");

        buttonElement.addEventListener("click", () => AppParameter.updateColor());

        AppParameter.colorParams.forEach(colorParam => {
            const tr = table.insertRow(-1);
            tr.appendChild(document.createElement("th"));
            for(let i=0;i<4;i++){
                tr.insertCell(-1);
            }
            tr.cells[0].appendChild(document.createTextNode(colorParam.name));
            this.#createColorInput(tr.cells[1],"枠",colorParam.frameColor);
            this.#createColorInput(tr.cells[2],"背景",colorParam.backColor);
            this.#createColorInput(tr.cells[3],"変更後",colorParam.backChangeColor);
            this.#createColorInput(tr.cells[4],"文字",colorParam.charColor);
        });
        AppParameter.updateColor();
    }
    #createColorInput(parentElement:HTMLElement, name:string, val:string)
    {
        parentElement.appendChild(document.createTextNode(name))
        const input = document.createElement("input");
        input.type = "color"
        input.value = val;
        parentElement.appendChild(input);
    }
    static updateColor()
    {
        const table= <HTMLTableElement>document.getElementById("paramColorTable");
        for(let row=0;row<AppParameter.colorParams.length;row++){
            const tr = table.rows[row];
            let element;
            element = <HTMLInputElement>tr.cells[1].lastChild;
            AppParameter.colorParams[row].frameColor = element.value;
            element = <HTMLInputElement>tr.cells[2].lastChild;
            AppParameter.colorParams[row].backColor = element.value;
            element = <HTMLInputElement>tr.cells[3].lastChild;
            AppParameter.colorParams[row].backChangeColor = element.value;
            element = <HTMLInputElement>tr.cells[4].lastChild;
            AppParameter.colorParams[row].charColor = element.value;
        }
    }
    #initSongParam()
    {
        /* ソースコードで登録している曲の選曲ボタン生成 */
        const songSelectElement = document.getElementById("SongSelect");
        AppParameter.MagicalMirai2021Songs.forEach(song => {
            this.#createSongLabel(songSelectElement,song.name);
        })

        const songURLbutton = document.getElementById("RequestSongURLButton");
        songURLbutton.addEventListener("click", AppParameter.updateSong)

        const table= <HTMLTableElement>document.getElementById("paramSongTable");
        const tr = table.insertRow(-1);
        tr.appendChild(document.createElement("th"));
        for(let i=0;i<5;i++){
            tr.insertCell(-1);
        }
        tr.cells[0].appendChild(document.createTextNode("生成時のID(空欄可)"));
        this.#createNumberInput(tr.cells[1], "lyricId")
        this.#createNumberInput(tr.cells[2], "lyricDiffId")
        this.#createNumberInput(tr.cells[3], "chordId")
        this.#createNumberInput(tr.cells[4], "beatId")
        this.#createNumberInput(tr.cells[5], "repetitiveSegmentId")
    }
    #createNumberInput(parentElement:HTMLElement, name:string)
    {
        parentElement.appendChild(document.createTextNode(name))
        const input = document.createElement("input");
        input.type = "number";
        input.style.width = "100px";
        parentElement.appendChild(input);
    }
    static updateSong()
    {
        const requestSongURLElement = <HTMLInputElement>document.getElementById("RequestSongURL");
        const url = requestSongURLElement.value;
        if(url.length<1){
            return;
        }
        AppParameter.songParam.url = url;
        const table= <HTMLTableElement>document.getElementById("paramSongTable");
        const tr = table.rows[0];
        let element;
        element = <HTMLInputElement>tr.cells[1].lastChild;
        AppParameter.songParam.lyricId = AppParameter.parseID(element);
        element = <HTMLInputElement>tr.cells[2].lastChild;
        AppParameter.songParam.lyricDiffId = AppParameter.parseID(element);
        element = <HTMLInputElement>tr.cells[3].lastChild;
        AppParameter.songParam.chordId = AppParameter.parseID(element);
        element = <HTMLInputElement>tr.cells[4].lastChild;
        AppParameter.songParam.beatId = AppParameter.parseID(element);
        element = <HTMLInputElement>tr.cells[5].lastChild;
        AppParameter.songParam.repetitiveSegmentId = AppParameter.parseID(element);
        TextAliveWrapper.changeSong(AppParameter.songParam);
    }
    static parseID(element:HTMLInputElement)
    {
        const value = element.value;
        if(value.length>0){
            return parseInt(value);
        }else{
            return undefined;
        }
    }
    /**
     * 選曲radioボタンとラベルのエレメントを生成
     * @param parent ラベルの追加先の親
     * @param songName ラベルに表示する曲名
     */
    #createSongLabel(parent:HTMLElement,songName:string)
    {
        const radio = document.createElement("input");
        radio.type="radio";
        radio.name="song";
        radio.id=songName;
        radio.value=songName;
        radio.addEventListener("input", (eve) => this.#onSongSelect(eve));

        const label = document.createElement("label");
        label.appendChild(radio);
        label.appendChild(document.createTextNode(songName));
        parent.appendChild(label);
    }
    /**
     * 選曲radioボタンからのinputイベントハンドラ
     * @param eve inputイベント
     */
    #onSongSelect(eve:Event)
    {
        const target = <HTMLInputElement>eve.target;
        const songName = target.value;

        let songURL;
        const songInfo = AppParameter.MagicalMirai2021Songs.find(song =>
            song.name == songName
        )
        if(songInfo){
            songURL = songInfo.defaultURL;
        }
        if(!songURL){
            console.warn("Selected not register song " + songName);
        }else{
            const table= <HTMLTableElement>document.getElementById("paramSongTable");
            const tr = table.rows[0];
            const requestSongURLElement = <HTMLInputElement>document.getElementById("RequestSongURL");
            requestSongURLElement.value = songURL;
            let element;
            element = <HTMLInputElement>tr.cells[1].lastChild;
            element.value = songInfo.lyricId.toFixed();
            element = <HTMLInputElement>tr.cells[2].lastChild;
            element.value = songInfo.lyricDiffId.toFixed();
            element = <HTMLInputElement>tr.cells[4].lastChild;
            element.value = songInfo.beatId.toFixed();
            element = <HTMLInputElement>tr.cells[5].lastChild;
            element.value = songInfo.repetitiveSegmentId.toFixed();
        }
    }
    static update (name: string, value: string | number | boolean | textaliveAppApi.IColor)
    {
        console.log("EVENT onAppParameterUpdate name:" + name + " value:" + value);
        switch (name)
        {
        default:
            console.log("no support parameter "+ name + ",", value)
            break;
        }
    }
}