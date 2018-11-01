import { GAME_CONFIG } from '../../constants/Constants'
import { currentScene } from '../../scenes/GameScene';
import { renderer } from '../render/Renderer';
import IsoPlugin,{IsoSprite, IsoPhysics } from 'phaser3-plugin-isometric'
import 'phaser';

export default class Enemy {
    speed:number;
    tween:Phaser.Tweens.Tween;
    sprite:IsoSprite;
    constructor(x, y, z, texture,frame?) {
        this.sprite = renderer.add(x, y, z, texture,frame);
        this.speed = 500;
    }

    goToGoal = (x, y):void => {
        if (this.tween && this.tween.isPlaying()) return;
        this.tween = currentScene.tweens.add({
            targets: this.sprite,
            props: {
                isoX: {
                    value: x * GAME_CONFIG.scale * GAME_CONFIG.tile_size,
                    duration: 1000 - this.speed,
                    ease: 'Linear'
                },
                isoY: {
                    value: y * GAME_CONFIG.scale * GAME_CONFIG.tile_size,
                    duration: 1000 - this.speed,
                    ease: 'Linear'
                }
            },
        });
    }
}