import * as THREE from "three";
import { AppParameter } from "../../appParameter";
import { TextAliveWrapper } from "../../textAliveWrapper";
import { Model } from "./model";

/**
 * 楽曲ロード中に表示するシーン
 */
export class LoadingScene
{
    scene:THREE.Scene;
    camera:THREE.PerspectiveCamera;
    lights:THREE.Light[];
    model:Model;

    #geometry:THREE.BoxBufferGeometry;
    #canvas:HTMLCanvasElement;
    #ctx:CanvasRenderingContext2D;
    #texture:THREE.Texture;
    #material:THREE.MeshPhongMaterial;
    #mesh:THREE.Mesh;
    #geometrySz = {x:6, y:1, z:0.1}

    nextSongURL:string;
    nextSongName:string;

    frameColor="black";
    backColor="white";
    charColor="black";
    /**
     * @param width 設定する幅
     * @param height 設定する高さ
     * @param model モデル
     */
    constructor(width:number, height:number, model:Model)
    {
        this.scene = this.#initScene();
        this.camera = this.#initCamera(width, height);
        this.lights = this.#initLight(this.scene);
        this.model = model;

        const sz = this.#geometrySz;
        this.#geometry = new THREE.BoxBufferGeometry(sz.x,sz.y,sz.z);
        this.#canvas = document.createElement("canvas");
        this.#canvas.width = 256*sz.x;
        this.#canvas.height = 256*sz.y;
        this.#ctx = this.#canvas.getContext("2d");
        this.#ctx.clearRect(0,0,this.#canvas.width,this.#canvas.height)

        this.#texture = new THREE.Texture(this.#canvas);
        this.#material = new THREE.MeshPhongMaterial({ map: this.#texture, transparent: true, alphaTest: 0.4, side: THREE.FrontSide});
        this.#mesh = new THREE.Mesh(this.#geometry, this.#material);
        this.#mesh.position.x = 0;
        this.#mesh.position.y = -2;
        this.#mesh.position.z = 40;
        this.scene.add(this.#mesh);
    }
    /**
     * 表示するロード状況更新
     * @param nowStatus 現在のロード状況
     * @param completeStatus ロード状況全体
     */
    setSongLoadStatus(nowStatus:number, completeStatus:number)
    {
        const strSongLoadStatus = "楽曲を読み込み中... " + nowStatus + " / " + completeStatus;
        const cv = this.#canvas;
        const ctx = this.#ctx;

        ctx.fillStyle = this.backColor;
        ctx.fillRect(0, 0, cv.width, cv.height);

        const fontSize = cv.height/6;

        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = this.charColor;
        ctx.font = "bold " + fontSize + "px sans-serif";
        ctx.fillText(strSongLoadStatus, cv.width/2, cv.height*1/4, cv.width)
        ctx.fillText(this.nextSongName, cv.width/2, cv.height*2/4, cv.width)
        ctx.fillText(this.nextSongURL, cv.width/2, cv.height*3/4, cv.width)

        // テクスチャの更新
        this.#texture.needsUpdate = true;
    }
    /**
     * 更新
     * @param seekTime シーク時間(ms)
     */
    update(seekTime:number)
    {
        const model = this.model;
        if(model.nowScene != this.scene){
            model.setModelScene(this.scene);
            model.setClip("walk");
            model.modelObject.rotation.x = 0;
            model.modelObject.rotation.y = Math.PI*0.85;
            model.modelObject.rotation.z = 0;
            model.modelObject.position.x = 0;
            model.modelObject.position.y = 0;
            model.modelObject.position.z = 0;
            model.setActionDuration(1000);
            this.nextSongURL = null;
        }
        if(!this.nextSongURL){
            this.nextSongURL = TextAliveWrapper.nextSongURL;
        }
        if(this.nextSongURL){
            const nextSong = AppParameter.MagicalMirai2021Songs.find(song =>
                song.defaultURL == this.nextSongURL
            )
            if(nextSong){
                this.nextSongName = nextSong.name;
            }else{
                this.nextSongName = "Not Registered Song"
            }
        }
        model.updateByDeltaTime();
    }
    /**
     * シーン生成
     * @returns シーン
     */
    #initScene()
    {
        const scene = new THREE.Scene();

        const col   = 0xeeeeee;
        scene.background = new THREE.Color(col);
        return scene;
    }
    /**
     * カメラ生成
     * @param width 画面の幅
     * @param height 画面の高さ
     * @returns カメラ
     */
    #initCamera(width:number, height:number)
    {
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);

        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 50;
        camera.lookAt(0, 0, 0);
        camera.up.set(0, 1, 0);
        return camera;
    }
    /**
     * ライト生成
     * @param scene シーン
     * @returns ライト
     */
    #initLight(scene:THREE.Scene)
    {
        const lights:THREE.Light[] = [];

        const light = new THREE.PointLight(0xFFFFFF,1.5, 50);
        light.position.set(0,5,5);
        scene.add(light);
        lights.push(light);

        const light2 = new THREE.PointLight(0xFFFFFF,2, 30);
        light2.position.set(0,0,50);
        scene.add(light2);
        lights.push(light2);

        return lights;
    }
    /**
     * 画面サイズの更新
     * @param width 画面の幅
     * @param height 画面の高さ
     */
    resize (width:number, height:number)
    {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}