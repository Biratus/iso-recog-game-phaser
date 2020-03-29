import 'phaser';
import IsoPlugin, { IsoPhysics, Point3 } from 'phaser3-plugin-isometric';
import { CLASSIC } from 'phaser3-plugin-isometric/src/Projector';
import { SCENE_GAME, GAME_CONFIG } from '../constants/Constants';
import { SCENE_TEST } from '../constants/Constants';
import { GameModule } from '../utils/GameModule';
import AnimationGraph from '../objects/render/AnimationGraph';
import Renderer, { renderer } from '../objects/render/Renderer';
import { RenderUtils } from '../utils/RenderUtils';
import Loader from '../utils/Loader';

export default class TestScene extends Phaser.Scene {
    animationGraph: AnimationGraph;
    container: Phaser.GameObjects.Container;
    constructor() {
        super(SCENE_TEST)
    }

    preload = () => {
        GameModule.currentScene = this;
        // PLUGIN
        this.load.scenePlugin({
            key: 'IsoPlugin',
            url: IsoPlugin,
            sceneKey: 'iso'
        });
        this.load.scenePlugin({
            key: 'IsoPhysics',
            url: IsoPhysics,
            sceneKey: 'isoPhysics'
        });
        Renderer.init();
    }
    spr;
    create = () => {
        this.spr = this.add.isoSprite(0, 0, 0, Renderer.roomTexture);
        let factor = GameModule.width() * GAME_CONFIG.roomRatio / this.spr.width;
        this.spr.scaleY = factor;
        this.spr.scaleX = factor;
        console.log(this);
    }
    update(time, delta) {
    }
}
