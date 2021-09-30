import * as textaliveAppApi from "textalive-app-api";
import { GlobalKeyDefine } from "./global";
import { AppParameter } from "./appParameter";

export interface songParam {
    url:string,
    beatId:number,
    chordId:number,
    repetitiveSegmentId:number,
    lyricId:number,
    lyricDiffId:number,
}
/**
 * TextAlive App APIのラッパー
 */
export class TextAliveWrapper {
    static #player: textaliveAppApi.Player;
    static #playerData: PlayerData;
    static nextSongURL: string; /* 次の曲のURLを持つ */
    dispatcher: TextAliveEventManager;
    constructor() {
        TextAliveWrapper.#player = this.#initPlayer();
        if (TextAliveWrapper.#player == null) {
            console.error("can't init player");
            return;
        }
        TextAliveWrapper.#playerData = new PlayerData(TextAliveWrapper.#player);
        this.dispatcher = new TextAliveEventManager(TextAliveWrapper.#player);
    }
    /**
     * データ取得
     */
    static get data() {
        return TextAliveWrapper.#playerData;
    }
    /**
     * 曲切り替え
     * @param songParam 曲のパラメータ
     */
    static changeSong(songParam:songParam) {
        console.log("request change song");
        console.log(songParam);
        TextAliveWrapper.#player.requestStop();
        TextAliveWrapper.nextSongURL = songParam.url;
        /* URLで作るとFailケースでエラーになる */
        /* Pathで作れば続行できる */
        const path = songParam.url.replace(/.*\/\//, "")
        const video:textaliveAppApi.PartialVideoEntry = {};
        if(songParam.beatId!=undefined) video.beatId = songParam.beatId;
        if(songParam.lyricId!=undefined) video.lyricId = songParam.lyricId;
        if(songParam.lyricDiffId!=undefined) video.lyricDiffId = songParam.lyricDiffId;
        if(songParam.chordId!=undefined) video.chordId = songParam.chordId;
        if(songParam.repetitiveSegmentId!=undefined) video.repetitiveSegmentId = songParam.repetitiveSegmentId;
        TextAliveWrapper.#player.createFromSongPath(path, {
            video: video
        });
    }
    /**
     * 再生要求
     */
    static requestPlay() {
        if (!TextAliveWrapper.#player.isPlaying) {
            TextAliveWrapper.#player.requestPlay();
        }
    }
    /**
     * 一時停止要求
     */
    static requestPause() {
        if (TextAliveWrapper.#player.isPlaying) {
            TextAliveWrapper.#player.requestPause();
        }
    }
    /**
     * シーク要求
     * @param seekTime シーク時間(ms)
     */
    static requestMediaSeek(seekTime: number) {
        TextAliveWrapper.#player.requestMediaSeek(seekTime);
    }
    /**
     * playerの初期化
     * @returns player
     */
    #initPlayer() {
        const media = document.getElementById("media");
        if (media == null) {
            console.error("media null");
            return null;
        }
        const player = new textaliveAppApi.Player({
            app: {
                appAuthor: "tokei39",
                appName: "Miku's Live",
                parameters: [
                ],
                token: "nQFn8JbsyjhGYKKD",
            },
            mediaElement: media,
            mediaBannerPosition: "embed",
            valenceArousalEnabled: false,
            vocalAmplitudeEnabled: true
        });
        return player;
    }
}

/**
 * TextAlive App APIのイベント管理
 */
class TextAliveEventManager {
    #player: textaliveAppApi.Player;
    loadStatusDefine = {
        noData: 1,
        appReady: 2,
        videoLoad: 3,
        songMapLoad: 4,
        songInfoLoad: 5,
        lyricsLoad: 6,
        fontsLoad: 7,
        textLoad: 8,
        videoReady: 9,
        timerReady: 10,
        completeLoad: 10
    };
    loadStatus: number = this.loadStatusDefine.noData;
    #songChanged: boolean = false;
    seekedTime: number = null;
    /**
     * @param player player
     */
    constructor(player: textaliveAppApi.Player) {
        this.#player = player;
        player.addListener({
            /* ロードステータス変更イベント */
            onAppReady: (app) => this.#loadStatusUpdated(this.loadStatusDefine.appReady),
            onVideoLoad: (video, reason) => this.#loadStatusUpdated(this.loadStatusDefine.videoLoad, reason),
            onSongMapLoad: (songMap, reason) => this.#loadStatusUpdated(this.loadStatusDefine.songMapLoad, reason),
            onSongInfoLoad: (songInfo, reason) => this.#loadStatusUpdated(this.loadStatusDefine.songInfoLoad, reason),
            onLyricsLoad: (lyrics, reason) => this.#loadStatusUpdated(this.loadStatusDefine.lyricsLoad, reason),
            onTextLoad: (lyricsBody, reason) => this.#loadStatusUpdated(this.loadStatusDefine.textLoad, reason),
            onFontsLoad: (font, reason) => this.#loadStatusUpdated(this.loadStatusDefine.fontsLoad, reason),
            onVideoReady: (video) => this.#loadStatusUpdated(this.loadStatusDefine.videoReady),
            onTimerReady: (timer) => this.#loadStatusUpdated(this.loadStatusDefine.timerReady),

            /* プレイステータス */
            //onPlay: () => this.#EventDetected("onPlay"),
            //onPause: () => this.#EventDetected("onPause"),
            //onStop: () => this.#EventDetected("onStop"),

            onSeek: (seekTime) => this.#onSeek(seekTime),
            //onMediaSeek: (seekTime) => this.#onMediaSeek(seekTime),
            //onVideoSeek: (seekTime) => this.#EventDetected("onVideoSeek"),
            //onVideoSeekStart: () => this.#EventDetected("onVideoSeekStart"),
            //onVideoSeekEnd: () => this.#EventDetected("onVideoSeekEnd"),
            //onTimeUpdate: (pos) => this.#EventDetected(pos.toString()),

            onAppParameterUpdate: (name, value) => AppParameter.update(name, value),
            //onResize: (size) => this.#EventDetected("onResize"),
            /* サイズ変更はWindow側で検知する */
            //onVolumeUpdate: (volume) => this.#EventDetected("onVolumeUpdate"),

            onAppMediaChange: (songUrl, video) => this.#onAppMediaChange(songUrl)
        });
    }
    get songChanged() {
        /* 取得したら判定を戻す */
        const songChanged = this.#songChanged;
        this.#songChanged = false;
        return songChanged;
    }
    /**
     * ロード状況の更新
     * @param status ロード状況
     * @param reason ロードが失敗したときの理由
     */
    #loadStatusUpdated(status: number, reason?: Error) {
        //console.log("LoadStatus: " + status);
        if (reason) {
            console.log(reason);
            return;
        }
        const sDefine = this.loadStatusDefine;
        if (status == sDefine.appReady) {
            /* TextAlive APP 準備完了 */
            if (!this.#player.app.managed) {
                /* 課題曲を選曲 */
                const song = AppParameter.MagicalMirai2021Songs.find(song =>
                    song.name == "夏をなぞって"
                );
                const songURL = song.defaultURL;
                console.log("Player not managed. select " + song.name);
                console.log("Player.createFromSongURL =>" +
                    " songURL: " + songURL +
                    " beatId: " + song.beatId +
                    " repetitiveSegmentId: " + song.repetitiveSegmentId +
                    " lyricId: " + song.lyricId +
                    " lyricDiffId: " + song.lyricDiffId
                );

                TextAliveWrapper.nextSongURL = songURL;
                /* ここではコンテストの指定通りURLから作成する */
                this.#player.createFromSongUrl(songURL, {
                    video: {
                        beatId: song.beatId,
                        repetitiveSegmentId: song.repetitiveSegmentId,
                        lyricId: song.lyricId,
                        lyricDiffId: song.lyricDiffId,
                    }
                });
            }
        } else if (status == sDefine.videoReady) {
            TextAliveWrapper.data.onVideoReady();
            TextAliveWrapper.nextSongURL = null;
        }
        /* アプリ側から曲変更したときにAppMediaChangeが呼ばれていないので、
        statusイベントが巻き戻って発行されていることを検知して判断する */
        if (status < this.loadStatus) {
            this.#songChanged = true;
            TextAliveWrapper.data.resetVideoReady();
        }
        this.loadStatus = status;
    }
    #EventDetected(str: string) {
        console.log("EVENT " + str);
    }

    #onSeek(seekTime: number) {
        this.seekedTime = seekTime;
        //console.log("onSeek " + seekTime);
    }

    #onAppMediaChange(songURL: string) {
        console.log("EVENT onAppMediaChange");
        this.#songChanged = true;
        TextAliveWrapper.nextSongURL = songURL;
        TextAliveWrapper.data.resetVideoReady();
    }
}
/**
 * TextAlive App APIのデータの管理
 */
class PlayerData {
    #player: textaliveAppApi.Player;
    songInfo: SongInfo;
    lyricInfo: LyricInfo;
    allChordInfo: AllChordInfo;
    allBeatInfo: AllBeatInfo;
    #videoReadied: boolean = false;
    /**
     * @param player player
     */
    constructor(player: textaliveAppApi.Player) {
        this.#player = player;
    }
    /**
     * VideoReadyになったときの処理
     */
    onVideoReady() {
        const player = this.#player;
        this.songInfo = new SongInfo(player.data)
        this.lyricInfo = new LyricInfo(player.video);
        this.allChordInfo = new AllChordInfo(player.data.songMap);
        this.allBeatInfo = new AllBeatInfo(player);
        this.#videoReadied = true;
    }
    /**
     * VideoReadyがリセットされたときの処理
     */
    resetVideoReady() {
        this.songInfo = null;
        this.lyricInfo = null;
        this.allChordInfo = null;
        this.allBeatInfo = null;
        this.#videoReadied = false;
    }
    /**
     * 再生中か
     */
    get isPlaying() {
        return this.#player.isPlaying;
    }
    /**
     * 現在のシーク時間
     */
    get nowSeekTime() {
        return this.#player.timer.position;
    }
    /**
     * 楽曲の全体の時間
     */
    get songTime() {
        if (!this.#videoReadied) return 0;
        return this.#player.video.duration;
    }
    /**
     * ボリューム取得
     * @param seekTime シーク時間(ms)
     * @returns ボリューム
     */
    getVolume(seekTime: number) {
        /* 声量ではなく音量が登録されている */
        //if(this.#player.video.findChar(seekTime)==null){
        //    return 0;
        //}
        return this.#player.getVocalAmplitude(seekTime);
    }
    /**
     * 楽曲の最大ボリューム取得
     * @returns ボリューム
     */
    getMaxVolume() {
        return this.#player.getMaxVocalAmplitude();
    }
}

/**
 * 楽曲情報
 */
export class SongInfo {
    songName: string
    songArtist: string
    lyricsArtist: string
    songURL: string
    /**
     * @param data データ
     */
    constructor(data: textaliveAppApi.IDataLoader) {
        let lyricsArtist;
        if (data.lyricsBody.artist) {
            lyricsArtist = data.lyricsBody.artist.name;
        } else {
            lyricsArtist = "未登録"
        }
        this.songName = data.song.name;
        this.songArtist = data.song.artist.name;
        this.lyricsArtist = lyricsArtist;
        this.songURL = data.song.permalink;
    }
}
/**
 * 歌詞情報
 */
export class LyricInfo {
    phraseInfos: LyricPhraseInfo[] = [];
    /**
     * @param video ビデオ
     */
    constructor(video: textaliveAppApi.IVideo) {
        this.phraseInfos = [];
        let p = video.firstPhrase;
        while (p != null) {
            this.phraseInfos.push(new LyricPhraseInfo(p));
            p = p.next;
        }
    }
}
/**
 * 歌詞のフレーズ情報
 */
export class LyricPhraseInfo {
    startTime: number;
    endTime: number;
    charInfos: LyricCharInfo[] = [];
    constructor(phrase: textaliveAppApi.IPhrase) {
        this.startTime = phrase.startTime;
        this.endTime = phrase.endTime;

        let phraseIndex = 0;
        for (let i = 0; i < phrase.children.length; i++) {
            const word = phrase.children[i];
            for (let j = 0; j < word.children.length; j++) {
                let isWordEnd = false;
                if (j == word.children.length - 1) {
                    isWordEnd = true;
                }
                this.charInfos.push(new LyricCharInfo(word.children[j], word.language, word.pos, this, phraseIndex, isWordEnd));
                phraseIndex += 1;
            }
        }
    }
}
/**
 * 歌詞の文字情報 アルファベットの場合
 */
export class LyricCharInfo {
    startTime: number;
    endTime: number;
    text: string;
    lang: string;
    pos: string;
    isWordEnd: boolean;
    phraseInfo: LyricPhraseInfo;
    phraseIndex: number;
    constructor(char: textaliveAppApi.IChar, lang: string, pos: string, phraseInfo: LyricPhraseInfo, phraseIndex: number, isWordEnd: boolean) {
        this.startTime = char.startTime;
        this.endTime = char.endTime;
        this.text = char.text;
        this.lang = lang;
        this.pos = pos;
        this.phraseInfo = phraseInfo;
        this.phraseIndex = phraseIndex;
        this.isWordEnd = isWordEnd;
    }
}

/**
 * 楽曲全体のビート情報
 */
export class AllBeatInfo {
    #player: textaliveAppApi.Player;
    #songMap: textaliveAppApi.ISongMap;
    beatNum: number;
    /**
     * @param player player
     */
    constructor(player: textaliveAppApi.Player) {
        this.#player = player;
        this.#songMap = player.data.songMap;
        this.beatNum = this.#songMap.beats.length;
    }
    /**
     * ビートのインデックスをもとにビート情報を取得
     * @param index インデックス
     * @returns ビート情報
     */
    getBeatByIndex(index: number) {
        const beats = this.#songMap.beats;
        let beat: BeatInfo;
        if (index == -1) {
            const firstBeat = beats[0];
            /* 小数点以下のビートには対応できていないため四捨五入 */
            beat = {
                time: {
                    start: 0,
                    end: Math.round(firstBeat.startTime)
                },
                index: -1
            }
        } else if (0 <= index && index < beats.length) {
            beat = {
                time: {
                    start: Math.round(beats[index].startTime),
                    end: Math.round(beats[index].endTime)
                },
                index: index
            }
        } else if (index == beats.length) {
            const lastBeat = beats[beats.length - 1];
            beat = {
                time: {
                    start: Math.round(lastBeat.endTime),
                    end: Math.round(TextAliveWrapper.data.songTime)
                },
                index: beats.length
            }
        } else {
            beat = null;
        }
        return beat;
    }
    /**
     * シーク時間をもとにビート情報を取得
     * @param seekTime シーク時間(ms)
     * @returns ビート情報
     */
    getBeatBySeekTime(seekTime: number) {
        const beatByApp = this.#player.findBeat(seekTime);
        let beat: BeatInfo;
        if (beatByApp) {
            beat = this.getBeatByIndex(beatByApp.index);
        } else {
            const firstBeat = this.getBeatByIndex(0);
            const lastBeat = this.getBeatByIndex(this.beatNum - 1)
            if (seekTime < firstBeat.time.start) {
                beat = this.getBeatByIndex(-1);
            } else if (lastBeat.time.end < seekTime) {
                beat = this.getBeatByIndex(this.beatNum);
            } else {
                console.warn("beat not found in " + seekTime);
                console.info(this.#songMap);
                beat = null;
            }
        }
        return beat;
    }
}
/**
 * ビート情報のインタフェース
 */
export interface BeatInfo {
    time: {
        start: number,
        end: number
    },
    index: number
}

/**
 * 楽曲全体のコード情報
 */
export class AllChordInfo {
    #songMap: textaliveAppApi.ISongMap;
    chordInfos: ChordInfo[] = [];

    /**
     * @param songMap songMap
     */
    constructor(songMap: textaliveAppApi.ISongMap) {
        this.#songMap = songMap;
        this.chordInfos = [];
        songMap.chords.forEach(chord => {
            this.chordInfos.push(new ChordInfo(chord.name, chord.startTime, chord.endTime));
        });
    }
}
/**
 * コード情報
 */
export class ChordInfo {
    name: string;
    startTime: number;
    endTime: number;
    chordKeyRoot: number;
    chordKey: number[];
    chordAttrIndexList = [
        { attr: "", indexes: [0, 4, 7] },
        { attr: "m", indexes: [0, 3, 7] },
        { attr: "dim", indexes: [0, 3, 6] },
        { attr: "aug", indexes: [0, 4, 8] },
        { attr: "7", indexes: [0, 4, 7, 10] },
        { attr: "m7", indexes: [0, 3, 7, 10] },
        { attr: "M7", indexes: [0, 4, 7, 11] },
        { attr: "6", indexes: [0, 4, 7, 9] },
        { attr: "dim7", indexes: [0, 3, 6, 9] },
    ]

    /**
     * @param chordName コード名
     * @param startTime 開始時間
     * @param endTime 終了時間
     */
    constructor(chordName: string, startTime: number, endTime: number) {
        this.name = chordName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.#parseChordName(chordName);
    }
    /**
     * コード名をもとにコードの音階を取得する
     * @param chordName コード名
     * @returns 成功したか
     */
    #parseChordName(chordName: string) {
        let chordBase = chordName[0];
        /* Nは多分コードなし */
        if (chordBase == "N") {
            this.chordKeyRoot = null;
            this.chordKey = null;
            return false;
        }

        /* #とbの解析 */
        if (chordName[1] == "#") {
            chordBase = chordBase + "#";
        } else if (chordName[1] == "b") {
            chordBase = chordBase + "b";
        }

        /* コードのベース音の音階取得 */
        let chordBaseIndex: number;
        if (chordName[1] == "b") {
            chordBaseIndex = GlobalKeyDefine.keyMapFlat.findIndex(key =>
                key == chordBase
            );
        } else {
            chordBaseIndex = GlobalKeyDefine.keyMapSharp.findIndex(key =>
                key == chordBase
            );
        }
        if (chordBaseIndex == -1) {
            console.log("not support chord:" + chordName);
            return false;
        }

        /* コードのベース音の名前後の属性を取得 */
        const slashIndex = chordName.indexOf("/");
        let chordAttr: string;
        if (slashIndex != -1) {
            chordAttr = chordName.slice(chordBase.length, slashIndex);
        } else {
            chordAttr = chordName.slice(chordBase.length, chordName.length);
        }
        const findIndex = this.chordAttrIndexList.findIndex(chordAttrIndex =>
            chordAttrIndex.attr == chordAttr
        )

        /* コード音の算出 */
        const tmpChordKey: number[] = [];
        if (findIndex == -1) {
            console.log("not support for " + chordName);
            tmpChordKey.push(chordBaseIndex);
        } else {
            const chordAttrIndex = this.chordAttrIndexList[findIndex];
            chordAttrIndex.indexes.forEach(index => {
                tmpChordKey.push(chordBaseIndex + index);
            })
        }

        /* オクターブの範囲超えた音を戻す */
        const chordMax = GlobalKeyDefine.keyMapSharp.length;
        tmpChordKey.forEach(function (keyNum, index, tmpChordKey) {
            if (keyNum >= chordMax) {
                tmpChordKey[index] = keyNum % chordMax;
            }
        }, this)
        this.chordKey = tmpChordKey;

        /* コードのルート音の文字列取得 */
        let slashChordRoot: string = null;
        if (slashIndex != -1) {
            slashChordRoot = chordName.slice(slashIndex + 1, chordName.length);
        }
        if (slashChordRoot) {
            const chordRootIndex = GlobalKeyDefine.keyMapSharp.findIndex(key =>
                key == slashChordRoot
            );
            this.chordKeyRoot = chordRootIndex;
        } else {
            this.chordKeyRoot = chordBaseIndex;
        }

        return true;
    }
}