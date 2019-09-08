import 'phaser';
import { IsoSprite } from 'phaser3-plugin-isometric';
import { GAME_CONFIG } from '../../constants/Constants';
import { ENEMY_TYPE, EVENTS } from '../../constants/Enums';
import { GameModule } from '../utils/GameUtils';
import { renderer } from '../render/Renderer';

export default class Enemy {
    static _idCount = 0;

    static ON_SPAWN = 'onSpawn';
    static ON_DIE = 'onDie';

    // core
    _id: number;
    _config: { x: number, y: number, z: number, texture: string, sign: string, frame?: number };
    tween: Phaser.Tweens.Tween;
    sprite: IsoSprite;
    spawningEvent;
    emitter: Phaser.Events.EventEmitter;

    type: string;
    sign: string;
    speed: number;
    isDead: boolean

    gotToGoalConfig: any;

    constructor(spriteConfig: { x: number, y: number, z: number, texture: string, sign: string, frame?: number }, type: string, speed) {
        this._id = Enemy._idCount++;
        this._config = spriteConfig;
        this.speed = speed;
        this.type = type;
        this.sign = this._config.sign;
        this.emitter = new Phaser.Events.EventEmitter();
    }

    get id() { return this._id; }

    create() {
        this.sprite = GameModule.currentScene.add.isoSprite(this._config.x, this._config.y, 0, this._config.texture);//renderer.addCharacterLayer(this._config.x, this._config.y, this._config.z, this._config.texture, this._config.frame);
        this.sprite.scaleX *= GAME_CONFIG.scale * GAME_CONFIG.enemyScale;
        this.sprite.scaleY *= GAME_CONFIG.scale * GAME_CONFIG.enemyScale;
        this.sprite.isoZ += this.sprite.isoBounds.height / 2;
        renderer.spritesContainer.add(this.sprite);
        this.emitter.emit(EVENTS.ENEMY_SPAWN);
    }

    goToGoal = (x, y, onFinish): void => {
        if ((this.tween && this.tween.isPlaying()) || this.speed <= 0) return;
        // console.log('dx='+Math.abs(this.sprite.isoX-x * GAME_CONFIG.scale * GAME_CONFIG.tile_size)/this.speed);
        // console.log('dy = '+Math.abs(this.sprite.isoY-y * GAME_CONFIG.scale * GAME_CONFIG.tile_size)+'ty = '+Math.abs(this.sprite.isoY-y * GAME_CONFIG.scale * GAME_CONFIG.tile_size)*300/this.speed);
        this.gotToGoalConfig = { x, y, onFinish };
        this.tween = GameModule.currentScene.tweens.add({
            targets: this.sprite,
            onComplete: () => onFinish(this),
            props: {
                isoX: {
                    value: x * GAME_CONFIG.scale * GAME_CONFIG.tile_size,
                    duration: Math.abs(this.sprite.isoX - x * GAME_CONFIG.scale * GAME_CONFIG.tile_size) * 300 / this.speed,
                    ease: 'Linear'
                },
                isoY: {
                    value: y * GAME_CONFIG.scale * GAME_CONFIG.tile_size,
                    duration: Math.abs(this.sprite.isoY - y * GAME_CONFIG.scale * GAME_CONFIG.tile_size) * 300 / this.speed,
                    ease: 'Linear'
                }
            },
        });
    }

    takeHit() {
        console.log(this.type+' '+this.sign+' ouch');
        switch (this.type) {
            case ENEMY_TYPE.SMALL:
                this.tween.stop();
                this.sprite.destroy();
                this.isDead = true;
                break;
            case ENEMY_TYPE.MEDIUM:
                this.tween.stop();
                //TODO knockback
                let x=(this.sprite.isoX - this.gotToGoalConfig.x)/Math.abs(this.sprite.isoX - this.gotToGoalConfig.x);
                let y=(this.sprite.isoY - this.gotToGoalConfig.y)/Math.abs(this.sprite.isoY - this.gotToGoalConfig.y);
                x*=GAME_CONFIG.scale * GAME_CONFIG.tile_size*0.02;
                y*=GAME_CONFIG.scale * GAME_CONFIG.tile_size*0.02
                this.tween = GameModule.currentScene.add.tween({
                    isoX: {
                        value: x,
                        duration: 100,
                        ease: 'Linear'
                    },
                    isoY: {
                        value: y,
                        duration: 100,
                        ease: 'Linear'
                    },
                    onComplete:() => this.goToGoal(this.gotToGoalConfig.x, this.gotToGoalConfig.y, this.gotToGoalConfig.onFinish)
                });
                this.type = ENEMY_TYPE.SMALL;
                this.sprite.texture = 'en_' + ENEMY_TYPE.SMALL + '_' + this.sign;
                /* IN THE FUTURE: 
                    replace texture change with animation and then give small texture
                */
                break;

        }
    }

    pause = () => { this.tween.pause(); }
    resume = () => { this.tween.resume(); }
}