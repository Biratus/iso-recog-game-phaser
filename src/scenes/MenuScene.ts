import 'phaser';
import { SCENE_MENU, SCENE_TUTORIAL, SCENE_GAME, DURATIONS } from '../constants/Constants';
import Renderer, { renderer } from '../objects/render/Renderer';
import { GameModule } from '../utils/GameModule';

export default class MenuScene extends Phaser.Scene {

    constructor() {
        super(SCENE_MENU);
    }

    preload = () => {
        GameModule.currentScene = this;
        Renderer.init();
    }

    create = () => {
        let play = this.add.image(GameModule.width() / 2, GameModule.height() / 2, 'play');
        play.scale = GameModule.width() * 0.2 / play.width;
        play.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        play.once('pointerup', () => {
            renderer.sceneTransition(SCENE_TUTORIAL.key);
            // renderer.sceneTransition(SCENE_GAME.key);
        });
        this.add.tween({
            targets:play,
            scale:play.scale-0.1,
            yoyo:true,
            loop: -1,
            duration:DURATIONS.scene.menu
        });

    }
}