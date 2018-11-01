import 'phaser'
import { SCENE_LOAD, SCENE_GAME } from '../constants/Constants'

export default class LoadScene extends Phaser.Scene {
    constructor() {
        super(SCENE_LOAD)
    }

    preload = () => {
        let assets = this.cache.json.get('assets');
        for (let type in assets) {
            for (let key in assets[type]) {
                let value = assets[type][key];
                if (type == 'spritesheet') this.load[type](key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.')), type + "/" + key, value);
                else this.load[type](value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('.')), type + "/" + assets[type][key]);
            }
        }
    }

    create = () => {
        this.scene.start(SCENE_GAME.key);
    }
}
