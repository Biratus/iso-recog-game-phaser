import 'phaser'
import { SCENE_LOAD, SCENE_GAME, SCENE_TUTORIAL, SCENE_MENU } from '../constants/Constants'

export default class LoadScene extends Phaser.Scene {
    constructor() {
        super(SCENE_LOAD)
    }

    preload = () => {
        let assets = this.cache.json.get('assets');
        for (let type in assets) {
            for (let key in assets[type]) {
                let value = assets[type][key];
                let path = type + "/";
                if (type == 'spritesheet') this.load[type](key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.')), path + key, value);
                else if(type == 'atlas') this.load[type](value,path+value+'.png',path+value+'.json');
                else this.load[type](value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('.')), path + assets[type][key]);
            }
        }
    }

    create = () => {
        this.scene.start(SCENE_MENU.key);
        // this.scene.start(SCENE_GAME.key);
        // this.scene.start(SCENE_TUTORIAL.key);
    }
}
