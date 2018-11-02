import { GAME_CONFIG, ENEMY_CONFIG } from '../../constants/Constants'
import { currentScene } from '../../scenes/GameScene';
import { renderer } from '../render/Renderer';
import IsoPlugin, { IsoSprite, IsoPhysics } from 'phaser3-plugin-isometric'
import 'phaser';
import { ENEMY_TYPE } from '../../constants/Enums';

export default class Enemy {
    static _idCount = 0;

    // core
    _id: number;
    tween: Phaser.Tweens.Tween;
    sprite: IsoSprite;
    spawnEvent;
    emitter: Phaser.Events.EventEmitter;

    type:string;
    speed: number;
    isDead:boolean

    constructor(spriteConfig: { x: number, y: number, z: number, texture: string, frame?: number }, type:string,spawnEvent?) {
        this._id = Enemy._idCount++;
        this.sprite = renderer.addCharacterLayer(spriteConfig.x, spriteConfig.y, spriteConfig.z, spriteConfig.texture, spriteConfig.frame);
        this.sprite.scaleX*=ENEMY_CONFIG.scale;
        this.sprite.scaleY*=ENEMY_CONFIG.scale;
        this.sprite.isoZ+=this.sprite.isoBounds.height/2;
        this.speed = 10;
        this.spawnEvent = spawnEvent;
        this.type=type;
        this.emitter = new Phaser.Events.EventEmitter();
    }

    get id() { return this._id; }

    goToGoal = (x, y,onFinish): void => {
        if ((this.tween && this.tween.isPlaying()) || this.speed<=0) return;
        this.tween = currentScene.tweens.add({
            targets: this.sprite,
            onComplete:() => onFinish(this),
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

    takeHit() {
        switch(this.type) {
            case ENEMY_TYPE.SMALL:
            console.log('ouch');
            this.sprite.destroy();
            this.isDead=true;
            break;
        }
    }

    pause = () => { this.tween.pause(); }
    resume = () => { this.tween.resume(); }
}