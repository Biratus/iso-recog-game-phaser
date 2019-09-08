import 'phaser';
import { ENEMY_SPAWN_EVENT, ENEMY_TYPE, LOCATION, EVENTS } from '../../constants/Enums';
import Enemy from '../character/Enemy';
import { renderer } from '../render/Renderer';
import { GameModule } from '../utils/GameUtils';
import { Timeout } from '../utils/Timeout';
import Entry from './Entry';
import MapUtils from '../utils/MapUtils';

export default class EnemyManager {
    entry: Entry;
    alive: Phaser.Structs.Map<number, Enemy>;
    timeouts: any = {};

    // config var
    nbEnSmall = 0;
    nbRndMed = 0;

    totEnemies = 0;

    spawnEventsEnemies: Phaser.Structs.Map<number, Enemy>;

    eventListener = new Phaser.Events.EventEmitter();

    someData = { enemyKilledSinceBegining: 0 };

    static enemySpeed = {};

    constructor(entry) {
        EnemyManager.enemySpeed[ENEMY_TYPE.SMALL] = 10;
        EnemyManager.enemySpeed[ENEMY_TYPE.MEDIUM] = 7;
        this.entry = entry;
        this.alive = new Phaser.Structs.Map<number, Enemy>([]);
        this.spawnEventsEnemies = new Phaser.Structs.Map<number, Enemy>([]);

        this.eventListener.addListener(EVENTS.REACH_CENTER, (en) => {
            this.someData.enemyKilledSinceBegining++;
            this.eventListener.emit(EVENTS.ENEMY_KILLED + this.someData.enemyKilledSinceBegining);
            GameModule.currentScene.events.emit(EVENTS.REACH_CENTER, en, this);
            en.isDead = true;
        });
    }

    spawn = (type) => {
        let e = new Enemy(this.getEnemyConfig(type), type,EnemyManager.enemySpeed[type]);
        e.create();
        this.alive.set(e.id, e);
        return e;
    }

    spawnRandom = (type): Enemy | undefined => {
        switch (type) {
            case ENEMY_TYPE.SMALL:
                if (this.nbEnSmall <= 0) return;
                this.nbEnSmall--;
                break;
            case ENEMY_TYPE.MEDIUM:
                if (this.nbRndMed <= 0) return;
                this.nbRndMed--;
                break;
        }
        console.log('spawning ' + type + ' ' + LOCATION.name(this.entry.location));
        return this.spawn(type);
    }

    getEnemyConfig(type) {
        let opEntry = renderer.getEntryTopBackLocationAt(LOCATION.name(this.entry.location)!);
        let position = { x: opEntry.x, y: opEntry.y };
        // let position = opEntry ? opEntry.getXYZLocation() : this.entry.getXYZLocation();
        //TODO figure out z with level.currentRoom.z;
        return {
            x: position.x,
            y: position.y,
            z: 0,
            sign: this.entry.sign.toLowerCase(),
            texture: 'en_' + type + '_' + this.entry.sign.toLowerCase()
        }

    }

    createMultiple(type, nb) {
        if (isNaN(nb)) nb = 0;
        this.totEnemies+=nb;
        switch (type) {
            case ENEMY_TYPE.SMALL:
                this.nbEnSmall = nb;
                break;
            case ENEMY_TYPE.MEDIUM:
                this.nbRndMed = nb;
                break;
        }
    }

    createMultipleEvent(nb,type, event) {
        for (let i = 0; i < nb; i++) {
            this.eventListener.once(event, () => {
                let e = this.spawn(type);
                if (e) e.goToGoal(0, 0, (en) => {
                    this.eventListener.emit(EVENTS.REACH_CENTER, en, this);
                });
            });
        }
    }

    makeAllDo = (behavior: (e: Enemy) => void) => {
        return this.alive.values().forEach(behavior);
    }

    start() {
        let smallInter = 2.5 * 1000 + this.totEnemies * 500;
        let medInter = 4.5 * 1000 + this.totEnemies * 500;
        let rndInter = 0.5 * 1000 + this.totEnemies * 250;
        // console.log('start enMana ' + this.entry.sign);
        this.timeouts.spawnSmall = Timeout.every(smallInter).randomized(-1*rndInter,rndInter ).do(() => {
            let e = this.spawnRandom(ENEMY_TYPE.SMALL);
            if (e) {
                e.goToGoal(0, 0, (en) => {
                    this.eventListener.emit(EVENTS.REACH_CENTER, en, this);
                });
                GameModule.currentScene.events.emit(Enemy.ON_SPAWN, e);
            } else this.timeouts.spawnSmall.destroy();
        }).start();

        this.timeouts.spawnMed = Timeout.every(medInter).randomized(-1*rndInter,rndInter).do(() => {
            let e = this.spawnRandom(ENEMY_TYPE.MEDIUM);

            if (e) {
                e.goToGoal(0, 0, (en) => {
                    this.eventListener.emit(EVENTS.REACH_CENTER, en, this);
                });
                GameModule.currentScene.events.emit(Enemy.ON_SPAWN, e);
            } else this.timeouts.spawnMed.destroy();
        }).start();

        this.eventListener.emit(EVENTS.GAME_START);//for enemy with game start evt
    }

    update(time, delta) {
        this.checkDeadEnemies();
    }

    pause() {
        // console.log('pause enMana ' + this.entry.sign);
        this.makeAllDo((en) => en.pause())
        if (MapUtils.of(this.timeouts).length() > 0) MapUtils.of(this.timeouts).forEach((elt) => elt.pause());
    }

    resume() {
        // console.log('resume enMana ' + this.entry.sign);
        this.makeAllDo((en) => en.resume());
        if (MapUtils.of(this.timeouts).length() > 0) MapUtils.of(this.timeouts).forEach((elt) => elt.resume());
    }

    getClosestWithSign(sign, nb?: number): Enemy[] {
        //TODO changer distance from 0,0 to GameModule getCenterOfGame ?
        let ordered = this.alive.values().filter((en) => en.sign.toLowerCase() === sign.toLowerCase()).sort((en1, en2) => Phaser.Math.Distance.Between(0, 0, en1.sprite.isoX, en1.sprite.isoY) - Phaser.Math.Distance.Between(0, 0, en2.sprite.isoX, en2.sprite.isoY));
        return ordered.splice(0, nb ? nb : 1);
    }

    checkDeadEnemies() {
        for (let eId of this.alive.keys()) {
            if (this.alive.get(eId).isDead) {
                console.log(this.alive.get(eId).sign+' is dead');
                this.alive.get(eId).sprite.destroy();
                this.alive.get(eId).emitter.emit(Enemy.ON_DIE);

                this.someData.enemyKilledSinceBegining++;
                this.eventListener.emit(EVENTS.ENEMY_KILLED + this.someData.enemyKilledSinceBegining);
                this.alive.delete(eId);
            }
        }
    }

    isOver() {
        this.checkDeadEnemies();
        return this.nbEnSmall <= 0 && this.nbRndMed <= 0 && this.alive.size == 0;
    }
}