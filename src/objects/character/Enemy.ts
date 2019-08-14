import { GAME_CONFIG, ENEMY_CONFIG } from '../../constants/Constants';
import  { IsoSprite } from 'phaser3-plugin-isometric'
import 'phaser';
import { ENEMY_TYPE } from '../../constants/Enums';
import { currentScene } from '../../scenes/TutorialScene';

export default class Enemy {
    static _idCount = 0;

    static ON_SPAWN='onSpawn';
    static ON_DIE='onDie';

    // core
    _id: number;
    _config: { x: number, y: number, z: number, texture: string, sign:string, frame?: number };
    tween: Phaser.Tweens.Tween;
    sprite: IsoSprite;
    spawningEvent;
    emitter: Phaser.Events.EventEmitter;

    type: string;
    sign: string;
    speed: number;
    isDead: boolean

    constructor(spriteConfig: { x: number, y: number, z: number, texture: string, sign:string,frame?: number }, type: string, onSpawnEvent,spawningEvent?) {
        this._id = Enemy._idCount++;
        this._config = spriteConfig;
        this.speed = 10;
        this.spawningEvent = spawningEvent;
        this.type = type;
        this.sign = this._config.sign;
        this.emitter = new Phaser.Events.EventEmitter();
        if (!this.spawningEvent) {
            this.create();
            onSpawnEvent(this);
        }
        else {
            this.emitter.on(spawningEvent.name,(enMana) => {
                this.create();
                spawningEvent.run(this,enMana);
            });
        }
        
    }

    get id() { return this._id; }

    create() {
        this.sprite = currentScene.add.isoSprite(this._config.x, this._config.y, 0,this._config.texture);//renderer.addCharacterLayer(this._config.x, this._config.y, this._config.z, this._config.texture, this._config.frame);
        this.sprite.scaleX *= GAME_CONFIG.scale * GAME_CONFIG.enemyScale;
        this.sprite.scaleY *= GAME_CONFIG.scale * GAME_CONFIG.enemyScale;
        this.sprite.isoZ += this.sprite.isoBounds.height / 2;
        this.emitter.emit(Enemy.ON_SPAWN);
    }

    goToGoal = (x, y, onFinish): void => {
        if ((this.tween && this.tween.isPlaying()) || this.speed <= 0) return;
        // console.log('dx='+Math.abs(this.sprite.isoX-x * GAME_CONFIG.scale * GAME_CONFIG.tile_size)/this.speed);
        // console.log('dy = '+Math.abs(this.sprite.isoY-y * GAME_CONFIG.scale * GAME_CONFIG.tile_size)+'ty = '+Math.abs(this.sprite.isoY-y * GAME_CONFIG.scale * GAME_CONFIG.tile_size)*300/this.speed);
        this.tween = currentScene.tweens.add({
            targets: this.sprite,
            onComplete: () => onFinish(this),
            props: {
                isoX: {
                    value: x * GAME_CONFIG.scale * GAME_CONFIG.tile_size,
                    duration: Math.abs(this.sprite.isoX-x * GAME_CONFIG.scale * GAME_CONFIG.tile_size)*300/this.speed,
                    ease: 'Linear'
                },
                isoY: {
                    value: y * GAME_CONFIG.scale * GAME_CONFIG.tile_size,
                    duration: Math.abs(this.sprite.isoY-y * GAME_CONFIG.scale * GAME_CONFIG.tile_size)*300 / this.speed,
                    ease: 'Linear'
                }
            },
        });
    }

    takeHit() {
        switch (this.type) {
            case ENEMY_TYPE.SMALL:
                console.log('ouch');
                this.tween.stop();
                this.sprite.destroy();
                this.isDead = true;
                break;
        }
    }

    pause = () => { this.tween.pause(); }
    resume = () => { this.tween.resume(); }
}