import { AppParameter, RegisteredSongInfo } from "../../../appParameter";

/**
 * 曲ごとに設定するデータ
 */
export class SongDataList
{
    list:SongData[] = [];
    defaultData:SongData;
    nowSongData:SongData;
    constructor()
    {
        this.defaultData = new SongDataDefault();
        this.list.push(new SongData0());
        this.list.push(new SongData1());
        this.list.push(new SongData2());
        this.list.push(new SongData3());
        this.list.push(new SongData4());
        this.list.push(new SongData5());
    }
    /**
     * 
     * @param songName 曲名
     */
    setSong(songName:string)
    {
        const index = this.list.findIndex(songData => 
            songData.song.name == songName
        );
        //console.log("set song " + songName + " index " + index);
        if(index > -1){
            this.nowSongData = this.list[index];
        }else{ /* 見つからなかったらデフォルトデータを利用 */
            this.nowSongData = this.defaultData;
        }
    }
}
/**
 * ライトデータ
 */
export interface LightData{
    beat:{start:number, end:number},
    lightIntensity:{min:number, max:number},
    lightColor:{r:number,g:number,b:number},
}
/**
 * アクションデータ
 */
export interface ActionData{
    beat:{start:number, end:number},
    action:string,
    actionBeats:number
}
/**
 * 曲データクラスの継承元
 */
export class SongData
{
    song:RegisteredSongInfo;

    penLightActions = {
        shakeDown1 : "PLA_shakeDown.001",// 1
        shakeDown2 : "PLA_shakeDown.002", // 1
        shakeDown3 : "PLA_shakeDown.003",
        shakeDown_shakeUp : "PLA_shakeDown_shakeUp",
        shakeDown_slowUp: "PLA_shakeDown_slowUp",
        shakeDown1_shakeDownSway : "PLA_shakeDown1_shakeDownSway",
        shakeDown_shakeDownUp: "PLA_shakeDown_shakeDownUp",
        shakeDownSway : "PLA_shakeDownSway", // 1
        shakeDownSway_slowUp : "PLA_shakeDownSway_slowUp",
        shakeDownSway_shakeUp : "PLA_shakeDownSway_shakeUp",
        shakeUp : "PLA_shakeUp.001",
        shakeUp_shakeDownUp : "PLA_shakeUp_shakeDownUp",
        shakeUp_shakeDown: "PLA_shakeUp_shakeDown",
        shakeUp_slowUp: "PLA_shakeUp_slowUp",
        shakeDownUp : "PLA_shakeDownUp.001",
        shakeDownUp_shakeDown : "PLA_shakeDownUp_shakeDown",
        shakeDownUp_shakeUp : "PLA_shakeDownUp_shakeUp",
        shakeDownUp_slowUp: "PLA_shakeDownUp_slowUp",
        shakeDownUp_wave: "PLA_shakeDownUp_wave",
        slowUp : "PLA_slowUp.001",
        slowUp_shakeDown: "PLA_slowUp_shakeDown",
        slowUp_shakeDownSway: "PLA_slowUp_shakeDownSway",
        slowUp_shakeDownUp: "PLA_slowUp_shakeDownUp",
        slowUp_shakeUp: "PLA_slowUp_shakeUp",
        slowUp_wave: "PLA_slowUp_songStart002",
        normal_wave : "PLA_songStart.001",
        normal_shakeUp : "PLA_normal_shakeUp",
        normal_shakeDown : "PLA_normal_shakeDown", // 1
        wave : "PLA_songStart.002",
        wave_shakeDown : "PLA_songStart002_shakeDown",
        wave_slowUp: "PLA_songStart002_slowUp",
    }
    actionData: ActionData[];
    actionDefault:ActionData;

    lightData: LightData[];
    lightDefault:LightData= {
        beat:{start:-1, end:Infinity},
        lightIntensity:{min:1.8, max:2.0},
        lightColor:{r:1,g:1,b:1},
    }
    constructor(songName:string)
    {
        const songIndex = AppParameter.MagicalMirai2021Songs.findIndex(song =>
            song.name == songName
        );
        if(0 <= songIndex && songIndex < AppParameter.MagicalMirai2021Songs.length){
            this.song = AppParameter.MagicalMirai2021Songs[songIndex];
        }else{
            //console.log("song not found for " + songName);
            this.song = null;
        }
        this.actionDefault = {
            beat:{start:-1, end:Infinity},
            action:this.penLightActions.shakeDownUp,
            actionBeats:2
        }
        this.actionData = [
            this.actionDefault,
        ]
        this.lightData = [
            this.lightDefault,
        ]
    }
}
/**
 * 曲データデフォルト
 */
class SongDataDefault extends SongData
{
    constructor()
    {
        super("defaultSongData");
        this.actionData = [
            this.actionDefault,
        ]
        this.lightData = [
            this.lightDefault,
        ]
    }
}
/**
 * "First Note"の曲データ
 */
class SongData0 extends SongData
{
    constructor()
    {
        super("First Note");
        const PLA = this.penLightActions;
        this.actionData = [
            {
                beat:{start:-1, end:0},
                action:PLA.normal_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:0, end:69},
                action:PLA.shakeDown1,
                actionBeats:3
            },
            {
                beat:{start:69, end:72},
                action:PLA.shakeDown1_shakeDownSway,
                actionBeats:3
            },
            {
                beat:{start:72, end:306},
                action:PLA.shakeDownSway,
                actionBeats:6
            },
            {
                beat:{start:306, end:312},
                action:PLA.shakeDownSway_slowUp,
                actionBeats:6
            },
            {
                beat:{start:312, end:324},
                action:PLA.slowUp_shakeDown,
                actionBeats:12
            },
            {
                beat:{start:324, end:333},
                action:PLA.shakeDown1,
                actionBeats:3
            },
            {
                beat:{start:333, end:336},
                action:PLA.shakeDown1_shakeDownSway,
                actionBeats:3
            },
            {
                beat:{start:336, end:576},
                action:PLA.shakeDownSway,
                actionBeats:6
            },
            {
                beat:{start:576, end:582},
                action:PLA.shakeDownSway_slowUp,
                actionBeats:6
            },
            {
                beat:{start:582, end:594},
                action:PLA.slowUp_shakeDown,
                actionBeats:12
            },
            {
                beat:{start:594, end:627},
                action:PLA.shakeDown1,
                actionBeats:3
            },
            {
                beat:{start:627, end:630},
                action:PLA.shakeDown1_shakeDownSway,
                actionBeats:3
            },
            {
                beat:{start:630, end:816},
                action:PLA.shakeDownSway,
                actionBeats:6
            },
            {
                beat:{start:816, end:822},
                action:PLA.shakeDownSway_slowUp,
                actionBeats:6
            },
            {
                beat:{start:822, end:834},
                action:PLA.slowUp_shakeDownSway,
                actionBeats:12
            },
            {
                beat:{start:834, end:864},
                action:PLA.shakeDownSway,
                actionBeats:6
            },
            {
                beat:{start:864, end:870},
                action:PLA.shakeDownSway_slowUp,
                actionBeats:6
            },
            {
                beat:{start:870, end:882},
                action:PLA.slowUp,
                actionBeats:12
            },
            {
                beat:{start:882, end:896},
                action:PLA.slowUp,
                actionBeats:14
            },
            {
                beat:{start:896, end:914},
                action:PLA.slowUp_wave,
                actionBeats:18
            },
            {
                beat:{start:914, end:930},
                action:PLA.wave,
                actionBeats:2
            },
        ]
    }
}
/**
 * "嘘も本当も君だから"の曲データ
 */
class SongData1 extends SongData
{
    constructor()
    {
        super("嘘も本当も君だから");
        const PLA = this.penLightActions;
        this.actionData = [
            {
                beat:{start:-1, end:-0.7},
                action:PLA.normal_wave,
                actionBeats:0.3
            },
            {
                beat:{start:-0.7, end:-0.3},
                action:PLA.wave,
                actionBeats:0.2
            },
            {
                beat:{start:-0.3, end:0},
                action:PLA.wave_shakeDown,
                actionBeats:0.3
            },
            {
                beat:{start:0, end:59},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:59, end:60},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:60, end:63},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:63, end:64},
                action:PLA.shakeUp_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:64, end:96},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:96, end:97},
                action:PLA.shakeDownUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:97, end:159},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:159, end:160},
                action:PLA.shakeDown_slowUp,
                actionBeats:1
            },
            {
                beat:{start:160, end:184},
                action:PLA.slowUp,
                actionBeats:4
            },
            {
                beat:{start:184, end:188},
                action:PLA.slowUp_shakeDownUp,
                actionBeats:4
            },
            {
                beat:{start:188, end:190},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:190, end:192},
                action:PLA.shakeDownUp_shakeUp,
                actionBeats:2
            },
            {
                beat:{start:192, end:255},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:255, end:256},
                action:PLA.shakeUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:256, end:319},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:319, end:320},
                action:PLA.shakeDown_slowUp,
                actionBeats:1
            },
            {
                beat:{start:320, end:344},
                action:PLA.slowUp,
                actionBeats:4
            },
            {
                beat:{start:344, end:348},
                action:PLA.slowUp_shakeDownUp,
                actionBeats:4
            },
            {
                beat:{start:348, end:350},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:350, end:352},
                action:PLA.shakeDownUp_shakeUp,
                actionBeats:2
            },
            {
                beat:{start:352, end:415},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:415, end:416},
                action:PLA.shakeUp_slowUp,
                actionBeats:1
            },
            {
                beat:{start:416, end:444},
                action:PLA.slowUp,
                actionBeats:4
            },
            {
                beat:{start:444, end:448},
                action:PLA.slowUp_shakeDown,
                actionBeats:4
            },
            {
                beat:{start:448, end:507},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:507, end:508},
                action:PLA.shakeUp_slowUp,
                actionBeats:1
            },
            {
                beat:{start:508, end:512},
                action:PLA.slowUp_shakeUp,
                actionBeats:4
            },
            {
                beat:{start:508, end:512},
                action:PLA.slowUp_shakeUp,
                actionBeats:4
            },
            {
                beat:{start:512, end:575},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:575, end:576},
                action:PLA.shakeUp_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:576, end:606},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:606, end:608},
                action:PLA.shakeDownUp_wave,
                actionBeats:2
            },
            {
                beat:{start:608, end:610},
                action:PLA.wave,
                actionBeats:0.3
            },
        ]
    }
}
/**
 * "Freedom!"の曲データ
 */
class SongData2 extends SongData
{
    constructor()
    {
        super("Freedom!");
        const PLA = this.penLightActions;
        this.actionData = [
            {
                beat:{start:-1, end:0},
                action:PLA.normal_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:0, end:8},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:8, end:9},
                action:PLA.shakeUp_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:9, end:41},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:41, end:42},
                action:PLA.shakeDownUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:42, end:72},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:72, end:73},
                action:PLA.shakeDown_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:73, end:89},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:89, end:90},
                action:PLA.shakeDownUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:90, end:148},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:148, end:149},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:149, end:150},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:150, end:151},
                action:PLA.shakeUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:151, end:152},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:152, end:153},
                action:PLA.shakeUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:153, end:154},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:154, end:155},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:155, end:156},
                action:PLA.shakeUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:156, end:157},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:157, end:200},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:200, end:201},
                action:PLA.shakeUp_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:201, end:233},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:233, end:234},
                action:PLA.shakeDownUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:234, end:292},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:292, end:293},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:293, end:294},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:294, end:295},
                action:PLA.shakeUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:295, end:296},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:296, end:297},
                action:PLA.shakeUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:297, end:298},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:298, end:299},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:299, end:300},
                action:PLA.shakeUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:300, end:301},
                action:PLA.shakeDown_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:301, end:331},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:331, end:333},
                action:PLA.shakeDownUp_shakeUp,
                actionBeats:2
            },
            {
                beat:{start:333, end:365},
                action:PLA.shakeUp,
                actionBeats:2
            },
            {
                beat:{start:365, end:412},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:412, end:413},
                action:PLA.shakeUp_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:413, end:473},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:473, end:474},
                action:PLA.shakeDownUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:474, end:475},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:475, end:476},
                action:PLA.shakeDown_slowUp,
                actionBeats:1
            },
            {
                beat:{start:476, end:480},
                action:PLA.slowUp,
                actionBeats:4
            },
            {
                beat:{start:480, end:484.2},
                action:PLA.slowUp_wave,
                actionBeats:4.2
            },
            {
                beat:{start:484.2, end:485},
                action:PLA.wave,
                actionBeats:0.1
            },
            this.actionDefault,
        ]
    }
}
/**
 * "その心に灯る色は"の曲データ
 */
class SongData3 extends SongData
{
    constructor()
    {
        super("その心に灯る色は");
        const PLA = this.penLightActions;
        this.actionData = [
            {
                beat:{start:-1, end:-0.8},
                action:PLA.normal_wave,
                actionBeats:0.2
            },
            {
                beat:{start:-0.8, end:-0.2},
                action:PLA.wave,
                actionBeats:0.2
            },
            {
                beat:{start:-0.2, end:0},
                action:PLA.wave_slowUp,
                actionBeats:0.2
            },
            {
                beat:{start:0, end:4},
                action:PLA.slowUp_shakeUp,
                actionBeats:4
            },
            {
                beat:{start:4, end:67},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:67, end:68},
                action:PLA.shakeUp_slowUp,
                actionBeats:1
            },
            {
                beat:{start:68, end:92},
                action:PLA.slowUp,
                actionBeats:8
            },
            {
                beat:{start:92, end:100},
                action:PLA.slowUp_shakeDown,
                actionBeats:8
            },
            {
                beat:{start:100, end:164},
                action:PLA.shakeDown3,
                actionBeats:1
            },
            {
                beat:{start:164, end:196},
                action:PLA.shakeDown2,
                actionBeats:4
            },
            {
                beat:{start:196, end:198},
                action:PLA.shakeDown1,
                actionBeats:2
            },
            {
                beat:{start:198, end:200},
                action:PLA.shakeDown_slowUp,
                actionBeats:2
            },
            {
                beat:{start:200, end:204},
                action:PLA.slowUp_shakeUp,
                actionBeats:4
            },
            {
                beat:{start:204, end:267},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:267, end:268},
                action:PLA.shakeUp_slowUp,
                actionBeats:1
            },
            {
                beat:{start:268, end:276},
                action:PLA.slowUp,
                actionBeats:8
            },
            {
                beat:{start:276, end:284},
                action:PLA.slowUp_shakeDownUp,
                actionBeats:8
            },
            {
                beat:{start:284, end:300},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:300, end:301},
                action:PLA.shakeDownUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:301, end:364},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:364, end:390},
                action:PLA.shakeDown2,
                actionBeats:4
            },
            {
                beat:{start:390, end:391},
                action:PLA.shakeDown_slowUp,
                actionBeats:1
            },
            {
                beat:{start:391, end:395},
                action:PLA.slowUp_shakeUp,
                actionBeats:4
            },
            {
                beat:{start:395, end:463},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:463, end:464},
                action:PLA.shakeUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:464, end:514},
                action:PLA.shakeDown3,
                actionBeats:1
            },
            {
                beat:{start:514, end:515},
                action:PLA.shakeDown_slowUp,
                actionBeats:1
            },
            {
                beat:{start:515, end:519},
                action:PLA.slowUp,
                actionBeats:4
            },
            {
                beat:{start:519, end:525},
                action:PLA.slowUp_shakeDown,
                actionBeats:6
            },
            {
                beat:{start:525, end:582},
                action:PLA.shakeDown3,
                actionBeats:1
            },
            {
                beat:{start:582, end:584},
                action:PLA.shakeDown_slowUp,
                actionBeats:1
            },
            {
                beat:{start:584, end:592},
                action:PLA.slowUp,
                actionBeats:8
            },
            {
                beat:{start:592, end:596},
                action:PLA.slowUp_shakeDown,
                actionBeats:4
            },
            {
                beat:{start:596, end:632},
                action:PLA.shakeDown3,
                actionBeats:1
            },
            {
                beat:{start:632, end:633},
                action:PLA.shakeDown_slowUp,
                actionBeats:1
            },
            {
                beat:{start:633, end:641},
                action:PLA.slowUp_shakeUp,
                actionBeats:8
            },
            {
                beat:{start:641, end:711},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:711, end:712},
                action:PLA.shakeUp_slowUp,
                actionBeats:1
            },
            {
                beat:{start:712, end:720},
                action:PLA.slowUp,
                actionBeats:8
            },
            {
                beat:{start:720, end:729},
                action:PLA.slowUp_shakeDownUp,
                actionBeats:9
            },
            {
                beat:{start:729, end:775},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:775, end:777},
                action:PLA.shakeDownUp_slowUp,
                actionBeats:2
            },
            {
                beat:{start:777, end:787.2},
                action:PLA.slowUp_wave,
                actionBeats:10.2
            },
            {
                beat:{start:787.2, end:788},
                action:PLA.wave,
                actionBeats:0.1
            },
            {
                beat:{start:787.8, end:788},
                action:PLA.wave_shakeDown,
                actionBeats:0.2
            },
            this.actionDefault,
        ]
    }
}
/**
 * "夏をなぞって"の曲データ
 */
class SongData4 extends SongData
{
    constructor()
    {
        super("夏をなぞって");
        const PLA = this.penLightActions;
        this.actionData = [
            {
                beat:{start:-1, end:-0.8},
                action:PLA.normal_wave,
                actionBeats:0.2
            },
            {
                beat:{start:-0.8, end:-0.2},
                action:PLA.wave,
                actionBeats:0.3
            },
            {
                beat:{start:-0.2, end:0},
                action:PLA.wave_shakeDown,
                actionBeats:0.2
            },
            {
                beat:{start:0, end:39},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:39, end:40},
                action:PLA.shakeDown1_shakeDownSway,
                actionBeats:1
            },
            {
                beat:{start:40, end:70},
                action:PLA.shakeDownSway,
                actionBeats:2
            },
            {
                beat:{start:70, end:72},
                action:PLA.shakeDownSway_shakeUp,
                actionBeats:2
            },
            {
                beat:{start:72, end:103},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:103, end:104},
                action:PLA.shakeUp_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:104, end:118},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:118, end:120},
                action:PLA.shakeDownUp_shakeDown,
                actionBeats:2
            },
            {
                beat:{start:120, end:150},
                action:PLA.shakeDown2,
                actionBeats:2
            },
            {
                beat:{start:150, end:152},
                action:PLA.shakeDown_slowUp,
                actionBeats:2
            },
            {
                beat:{start:152, end:156},
                action:PLA.slowUp_shakeUp,
                actionBeats:4
            },
            {
                beat:{start:156, end:187},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:187, end:188},
                action:PLA.shakeUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:188, end:220},
                action:PLA.shakeDown2,
                actionBeats:2
            },
            {
                beat:{start:220, end:233},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:233, end:234},
                action:PLA.shakeDown_slowUp,
                actionBeats:1
            },
            {
                beat:{start:234, end:236.5},
                action:PLA.slowUp_wave,
                actionBeats:2.5
            },
            {
                beat:{start:236.5, end:237},
                action:PLA.wave,
                actionBeats:0.5
            },
            this.actionDefault,
        ]
    }
}
/**
 * "密かなる交信曲"の曲データ
 */
class SongData5 extends SongData
{
    constructor()
    {
        super("密かなる交信曲");
        const PLA = this.penLightActions;
        this.actionData = [
            {
                beat:{start:-1, end:-0.8},
                action:PLA.normal_wave,
                actionBeats:0.2
            },
            {
                beat:{start:-0.8, end:-0.2},
                action:PLA.wave,
                actionBeats:0.2
            },
            {
                beat:{start:-0.2, end:0},
                action:PLA.wave_shakeDown,
                actionBeats:0.2
            },
            {
                beat:{start:0, end:11},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:11, end:12},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:12, end:15},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:15, end:16},
                action:PLA.shakeUp_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:16, end:32},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:32, end:33},
                action:PLA.shakeDownUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:33, end:95},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:95, end:96},
                action:PLA.shakeDown_slowUp,
                actionBeats:1
            },
            {
                beat:{start:96, end:108},
                action:PLA.slowUp,
                actionBeats:4
            },
            {
                beat:{start:108, end:112},
                action:PLA.slowUp_shakeDown,
                actionBeats:4
            },
            {
                beat:{start:112, end:132},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:132, end:135},
                action:PLA.shakeDown2,
                actionBeats:2
            },
            {
                beat:{start:135, end:136},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:136, end:167},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:167, end:168},
                action:PLA.shakeUp_slowUp,
                actionBeats:1
            },
            {
                beat:{start:168, end:172},
                action:PLA.slowUp,
                actionBeats:4
            },
            {
                beat:{start:172, end:176},
                action:PLA.slowUp_shakeDownUp,
                actionBeats:4
            },
            {
                beat:{start:176, end:208},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:208, end:209},
                action:PLA.shakeDownUp_shakeDown,
                actionBeats:1
            },
            {
                beat:{start:209, end:271},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:271, end:272},
                action:PLA.shakeDown_shakeDownUp,
                actionBeats:1
            },
            {
                beat:{start:272, end:334},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:334, end:336},
                action:PLA.shakeDownUp_slowUp,
                actionBeats:2
            },
            {
                beat:{start:336, end:364},
                action:PLA.slowUp,
                actionBeats:4
            },
            {
                beat:{start:364, end:368},
                action:PLA.slowUp_shakeDown,
                actionBeats:4
            },
            {
                beat:{start:368, end:420},
                action:PLA.shakeDown1,
                actionBeats:1
            },
            {
                beat:{start:420, end:421},
                action:PLA.shakeDown_shakeUp,
                actionBeats:1
            },
            {
                beat:{start:421, end:483},
                action:PLA.shakeUp,
                actionBeats:1
            },
            {
                beat:{start:483, end:484},
                action:PLA.shakeUp_slowUp,
                actionBeats:1
            },
            {
                beat:{start:484, end:488},
                action:PLA.slowUp,
                actionBeats:4
            },
            {
                beat:{start:488, end:492},
                action:PLA.slowUp_shakeDownUp,
                actionBeats:4
            },
            {
                beat:{start:492, end:528},
                action:PLA.shakeDownUp,
                actionBeats:2
            },
            {
                beat:{start:528, end:530},
                action:PLA.shakeDownUp_slowUp,
                actionBeats:2
            },
            {
                beat:{start:530, end:536},
                action:PLA.slowUp_wave,
                actionBeats:6
            },
            {
                beat:{start:536, end:544},
                action:PLA.wave,
                actionBeats:1
            },
            {
                beat:{start:544, end:Infinity},
                action:PLA.wave,
                actionBeats:0.25
            },
            this.actionDefault
        ]
    }
}