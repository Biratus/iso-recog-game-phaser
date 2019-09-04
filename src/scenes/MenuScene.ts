import 'phaser';
import { SCENE_MENU, SCENE_TUTORIAL, SCENE_GAME } from '../constants/Constants';
import { GameModule } from '../objects/utils/GameUtils';
import Renderer, { renderer } from '../objects/render/Renderer';

export default class MenuScene extends Phaser.Scene {

    constructor() {
        super(SCENE_MENU);
    }

    preload = () => {
        GameModule.currentScene = this;
        Renderer.init();
    }

    create = () => {
        let play = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'play').setScale(0.75);
        play.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        play.once('pointerup', () => {
            // renderer.sceneTransition(SCENE_TUTORIAL.key);
            renderer.sceneTransition(SCENE_GAME.key);
        });
        this.add.tween({
            targets:play,
            scale:0.8,
            yoyo:true,
            loop: -1,
            duration:750
        });

    }
}