import 'phaser';
import { IsoSprite } from 'phaser3-plugin-isometric';
import { GAME_CONFIG } from '../../constants/Constants';
import { ENEMY_TYPE, EVENTS } from '../../constants/Enums';
import { renderer } from '../render/Renderer';
import { GameModule } from '../utils/GameModule';

export default class Enemy {
    static _idCount = 0;

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

    goToGoalConfig: any;

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
        this.createSprite();
        this.emitter.emit(EVENTS.ENEMY_SPAWN);
    }

    private createSprite() {
        // this.sprite = GameModule.currentScene.add.isoSprite(this._config.x, this._config.y, 0, this._config.texture);
        this.sprite = GameModule.currentScene.add.isoSprite(this._config.x, this._config.y, 0, 'en_'+this.type+'_'+this.sign);
        this.sprite.scaleX *= GAME_CONFIG.scale * GAME_CONFIG.enemyScale;
        this.sprite.scaleY *= GAME_CONFIG.scale * GAME_CONFIG.enemyScale;
        this.sprite.isoZ += this.sprite.isoBounds.height / 2;
        renderer.characterContainer.add(this.sprite);
    }

    goToGoal = (x, y, onGoalReached): void => {
        if ((this.tween && this.tween.isPlaying()) || this.speed <= 0) this.tween.stop();
        // console.log('dx='+Math.abs(this.sprite.isoX-x * GAME_CONFIG.scale * GAME_CONFIG.tile_size)/this.speed);
        // console.log('dy = '+Math.abs(this.sprite.isoY-y * GAME_CONFIG.scale * GAME_CONFIG.tile_size)+'ty = '+Math.abs(this.sprite.isoY-y * GAME_CONFIG.scale * GAME_CONFIG.tile_size)*300/this.speed);
        this.goToGoalConfig = { x, y, onGoalReached };
        this.tween = GameModule.currentScene.tweens.add({
            targets: this.sprite,
            onComplete: () => {
                onGoalReached(this);
            },
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
                this.isDead = true;
                this.tween.stop();
                this.sprite.destroy();
                break;
            case ENEMY_TYPE.MEDIUM:
                this.tween.pause();
                let start = {isoX:this.goToGoalConfig.x,isoY:this.goToGoalConfig.y};
                for(let data of this.tween.data) {
                    if(data.key=='isoX' || data.key=='isoY') (<any>start)[data.key]=data.start;
                }
                let x=(start.isoX+this.sprite.isoX)/2;
                let y=(start.isoY+this.sprite.isoY)/2;
                this.tween = GameModule.currentScene.add.tween({
                    targets:this.sprite,
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
                    onComplete:() => {
                        this.type = ENEMY_TYPE.SMALL;
                        this._config.x=this.sprite.isoX;
                        this._config.y=this.sprite.isoY;
                        this.sprite.destroy();
                        this.createSprite();
                        /* IN THE FUTURE: 
                            replace texture change with animation and then give small texture
                        */
                        this.goToGoal(this.goToGoalConfig.x,this.goToGoalConfig.y,this.goToGoalConfig.onGoalReached);
                    }
                });
                break;

        }
    }

    pause = () => { this.tween.pause(); }
    resume = () => { this.tween.resume(); }
}