import * as THREE from "three";
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/* 参考：
    https://threejsfundamentals.org
    https://qiita.com/adrs2002/items/dc6416d6fd2389c75ab5
    https://tmamagoto.com/blendershape/
*/

/**
 * Three.jsのモデルを操作
 */
export class Model
{
    isReady:boolean = false;
    modelData:ModelData;

    mixer:THREE.AnimationMixer;
    clock:THREE.Clock;
    modelObject:THREE.Object3D;
    morphKeys:string[];
    morphValues:number[];
    clips:THREE.AnimationClip[];
    penLightMaterial:THREE.MeshStandardMaterial;

    nowClip:THREE.AnimationClip;
    nowAction:THREE.AnimationAction;
    preSeekTime:number = null;
    nowScene:THREE.Scene;
    constructor()
    {
        this.modelData = new ModelData(this.#modelLoaded, this);
        this.clock = new THREE.Clock();
    }
    /**
     * モデルロード完了後に実行するコールバック
     */
    #modelLoaded()
    {
        this.modelObject = this.modelData.gltf.scene.getObjectByName("Armature");
        const miku = this.modelObject.getObjectByName("Miku");

        ModelData.devAllMesh(miku, (mesh:THREE.Mesh) => {
            if(mesh.morphTargetDictionary){
                this.morphKeys = Object.keys(mesh.morphTargetDictionary);
                if(this.morphKeys) return false;
            }
            return true;
        }, this);
        this.morphValues = new Array(this.morphKeys.length);
        //console.log(this.morphKeys);
        const penLight = this.modelData.gltf.scene.getObjectByName("penLight");
        const penLightLight = <THREE.SkinnedMesh>penLight.children[1];
        this.penLightMaterial = <THREE.MeshStandardMaterial>penLightLight.material;
        /* ペンライトの色を制御したかった */

        this.mixer = new THREE.AnimationMixer(this.modelObject);
        this.clips = this.modelData.gltf.animations;
        this.isReady = true;
    }
    /**
     * 経過時間で更新
     */
    updateByDeltaTime(){
        const deltaTime = this.clock.getDelta();
        this.mixer.update(deltaTime);
    }
    /**
     * 絶対時間で更新
     * @param actionTime アクション時間(ms)
     */
    updateByAbsoluteTime(actionTime:number){
        this.mixer.setTime(actionTime/1000)
    }
    /**
     * モデルをシーンに追加する
     * @param scene シーン
     */
    setModelScene(scene:THREE.Scene){
        scene.add(this.modelObject);
        this.nowScene = scene;
    }
    /**
     * モーフの値を設定する
     * @param key モーフのID
     * @param value 設定値
     */
    setMorphVal(key:String, value:number){
        const keyIndex = this.morphKeys.findIndex(morphKey =>
            morphKey == key
        )
        if(keyIndex > -1){
            if(this.morphValues[keyIndex]!=value){
                const miku = this.modelObject.getObjectByName("Miku");
                ModelData.devAllMesh(miku, (mesh:THREE.Mesh) => {
                    if(mesh.morphTargetInfluences &&
                        mesh.morphTargetInfluences.length > 0){
                        mesh.morphTargetInfluences[keyIndex] = value;
                    }
                    return true;
                });
                this.morphValues[keyIndex] = value;
            }
        }
    }
    /**
     * アクションの時間を設定する
     * @param duration アクションの時間
     */
    setActionDuration(duration:number){
        this.nowAction.setDuration(duration/1000);
    }
    /**
     * クリップからアクションを設定する
     * @param clipName クリップ名
     */
    setClip(clipName:String){
        if(this.nowClip && this.nowClip.name == clipName) return;
        const clip = this.clips.find(clip =>
            clip.name == clipName
        );
        if(clip){
            //console.log("clip " + clipName + " exist");
            this.nowClip = clip;
            if(this.nowAction){
                this.nowAction.stop();
            }
            this.nowAction = this.mixer.clipAction(clip);
            this.nowAction.play();
            //console.log(this.nowAction);
            this.nowAction.clampWhenFinished = true;
            this.preSeekTime = null;
        }else{
            console.warn("clip " + clipName + " not exist");
            console.log(this.clips);
        }
    }

}

/**
 * Three.jsのモデルを読み込む
 */
class ModelData
{
    gltf:GLTF = null;
    loadedCallback:() => void;
    loadedCallbackThis: any;
    progress:ProgressEvent;
    error:ErrorEvent;

    /**
     * @param loadedCallback モデルロードが完了したときのコールバック
     * @param thisArg コールバックのthis
     */
    constructor(loadedCallback:() => void, thisArg?:any){
        const loader = new GLTFLoader();
        const url = "./miku.glb";
        this.loadedCallback = loadedCallback;
        if(thisArg){
            this.loadedCallbackThis = thisArg;
        }else{
            this.loadedCallbackThis = this;
        }
        loader.load(
            url,
            gltf => this.#modelLoaded(gltf),
            event => this.#modelLoading(event),
            error => this.#modelError(error)
        );
    }
    /**
     * モデルロード中のコールバック
     * @param event モデルのロード状況
     */
    #modelLoading(event:ProgressEvent)
    {
        this.progress = event;
    }
    /**
     * モデルロード中のエラーのコールバック
     * @param error エラー内容
     */
    #modelError(error:ErrorEvent)
    {
        this.error = error;
        console.error(error);
    }
    /**
     * モデルロード完了のコールバック
     * @param gltf 読み込んだgltf
     */
    #modelLoaded(gltf:GLTF)
    {
        this.gltf = gltf;

        /* モデルの内容全体をログに出す */
        //console.log(this.#dumpObject(gltf.scene).join('\n'));

        this.loadedCallback.apply(this.loadedCallbackThis);
    }
    /**
     * オブジェクトのすべてのメッシュに対してメソッド実行
     * @param object オブジェクト
     * @param func メソッド
     * @param thisArg メソッドのthis
     */
    static devAllMesh(object:THREE.Object3D, func:(mesh:THREE.Mesh) => Boolean, thisArg?:any){
        const mesh = <THREE.Mesh>object;
        let ret:Boolean;
        if(mesh.isMesh){
            let callThis;
            if(thisArg){
                callThis = thisArg;
            }else{
                callThis = this;
            }
            ret = func.call(callThis, mesh);
            if(!ret) return ret;
        }

        for(let i=0; i<object.children.length; i++){
            ret = ModelData.devAllMesh(object.children[i], func);
            if(!ret) break;
        }
        return ret;
    }
    /**
     * Three.js fundamentalsから流用したログ出力用メソッド
     * @ref https://threejsfundamentals.org/threejs/lessons/threejs-load-gltf.html
     */
    #dumpVec3(v3:THREE.Vector3|THREE.Euler, precision = 3) {
        return `${v3.x.toFixed(precision)}, ${v3.y.toFixed(precision)}, ${v3.z.toFixed(precision)}`;
    }
    /**
     * Three.js fundamentalsから流用したログ出力用メソッド
     * @ref https://threejsfundamentals.org/threejs/lessons/threejs-load-gltf.html
     */
    #dumpObject(obj:THREE.Object3D, lines:string[] = [], isLast = true, prefix = '') {
        const localPrefix = isLast ? '└─' : '├─';
        lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
        const dataPrefix = obj.children.length
            ? (isLast ? '  │ ' : '│ │ ')
            : (isLast ? '    ' : '│   ');
        lines.push(`${prefix}${dataPrefix}  pos: ${this.#dumpVec3(obj.position)}`);
        lines.push(`${prefix}${dataPrefix}  rot: ${this.#dumpVec3(obj.rotation)}`);
        lines.push(`${prefix}${dataPrefix}  scl: ${this.#dumpVec3(obj.scale)}`);
        const newPrefix = prefix + (isLast ? '  ' : '│ ');
        const lastNdx = obj.children.length - 1;
        obj.children.forEach((child, ndx) => {
            const isLast = ndx === lastNdx;
            this.#dumpObject(child, lines, isLast, newPrefix);
        });
        return lines;
    }
}