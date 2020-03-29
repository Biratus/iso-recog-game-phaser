import 'phaser'
import { SCENE_LOAD, SCENE_GAME, SCENE_TUTORIAL, SCENE_MENU, SCENE_TEST } from '../constants/Constants'

export default class LoadScene extends Phaser.Scene {
    constructor() {
        super(SCENE_LOAD)
    }

    preload = () => {
        let assets = this.cache.json.get('assets');
        for (let type in assets) {
            if (type == 'atlas') assets[type].forEach(item => {
                let key = item.path.substring(0, item.path.lastIndexOf('.'));
                this.load[type](item.key, key + '.png', key + '.json')
            });
            else assets[type].forEach(item => this.load[type](item.key, item.path));
        }
    }

    create = () => {
        // this.scene.start(SCENE_TEST.key);
        this.scene.start(SCENE_MENU.key);
        // this.scene.start(SCENE_GAME.key);
        // this.scene.start(SCENE_TUTORIAL.key);
    }

    loadAsset = (type, key, path) => {

    }
}
