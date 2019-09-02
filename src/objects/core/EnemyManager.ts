import 'phaser';
import { ENEMY_SPAWN_EVENT, ENEMY_TYPE, LOCATION } from '../../constants/Enums';
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
    spawnEventsEnemies: Phaser.Structs.Map<number, Enemy>;

    eventListener = new Phaser.Events.EventEmitter();

    someData = { enemyKilledSinceBegining: 0 };

    constructor(entry) {
        this.entry = entry;
        this.alive = new Phaser.Structs.Map<number, Enemy>([]);
        this.spawnEventsEnemies = new Phaser.Structs.Map<number, Enemy>([]);

        this.eventListener.addListener('reachCenter', (en) => {
            this.someData.enemyKilledSinceBegining++;
            GameModule.currentScene.events.emit('enemyReachCenter', en, this);
            this.eventListener.emit('enemyKilled' + this.someData.enemyKilledSinceBegining);
            this.killInstant(en);
        });
    }

    spawnType = (type): Enemy | undefined => {
        let e;
        // console.log('spawning ' + type + ' ' + LOCATION.name(this.entry.location));
        switch (type) {
            case ENEMY_TYPE.SMALL:
                if (this.nbEnSmall <= 0) return;
                this.nbEnSmall--;
                e = this.createEnemy(this.getEnemyConfig(type), type);
                this.alive.set(e.id, e);
                break;
            case ENEMY_TYPE.MEDIUM:
                if (this.nbRndMed <= 0) return;
                this.nbRndMed--;
                e = this.createEnemy(this.getEnemyConfig(type), type);
                this.alive.set(e.id, e);
                break;
        }
        return e;
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
            sign: this.entry.sign,
            texture: 'en_' + type + '_' + this.entry.sign.toLowerCase()
        }

    }

    spawnEvent(event) {

    }

    createMultiple(type, nb) {
        if (isNaN(nb)) nb = 0;
        switch (type) {
            case ENEMY_TYPE.SMALL:
                this.nbEnSmall = nb;
                break;
        }
    }

    createMultipleMed(nb, event) {
        for (let i = 0; i < nb; i++) {
            let e = this.createEnemy(this.getEnemyConfig(ENEMY_TYPE.MEDIUM), ENEMY_TYPE.MEDIUM, event);
            this.spawnEventsEnemies.set(e.id, e);
        }
    }

    createEnemy(config, type, event?) {
        // console.log('create Enemy enMana '+this.entry.sign);
        let e = new Enemy(config, type, (en) => {
            this.alive.set(en.id, en);
            this.spawnEventsEnemies.delete(en.id);

        }, event);
        e.emitter.on(Enemy.ON_SPAWN, () => {
            this.alive.set(e.id, e);
            this.spawnEventsEnemies.delete(e.id);

        });
        return e;
    }

    makeAllDo = (behavior: (e: Enemy) => void) => {
        return this.alive.values().forEach(behavior);
    }

    start() {
        // console.log('start enMana ' + this.entry.sign);
        this.timeouts.spawnSmall = Timeout.every(3.5 * 1000).randomized(-1.5*1000, 1.5 * 1000).do(() => {
            let e = this.spawnType(ENEMY_TYPE.SMALL);

            if (e) {
                e.goToGoal(0, 0, (en) => {
                    this.eventListener.emit('reachCenter', en, this);
                });
                GameModule.currentScene.events.emit(Enemy.ON_SPAWN, e);
            } else this.timeouts.spawnSmall.destroy();
        }).start();

        // start spawn med en
        // let e = this.spawnType(ENEMY_TYPE.MEDIUM);
        // let c = renderer.getCenterXYOfRoom(this.entry.source);
        // e!.goToGoal(0,0, (en) => {
        //     this.killInstant(en,true);
        // });


    }

    update(time, delta) {
        for (let eId of this.alive.keys()) {
            if (this.alive.get(eId).isDead) {
                let rndE = this.spawnEventsEnemies.values()[Math.floor(Math.random() * this.spawnEventsEnemies.size)];
                if (this.spawnEventsEnemies.size > 0) rndE.emitter.emit(ENEMY_SPAWN_EVENT.PREVIOUS_DIE.name, this);
                this.alive.delete(eId);
            }
        }
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

    killInstant(enemy: Enemy, playEvent = false) {
        if (!playEvent) this.alive.delete(enemy.id);
        enemy.isDead = true;
        enemy.sprite.destroy();
        enemy.emitter.emit(Enemy.ON_DIE);
    }

    isOver() {
        return this.nbEnSmall <= 0;
    }
}