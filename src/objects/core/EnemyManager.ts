import 'phaser';
import Enemy from '../character/Enemy';
import Entry from './Entry';
import { Cube } from 'phaser3-plugin-isometric/src/Cube';
import { Point3 } from 'phaser3-plugin-isometric/src/Point3';
import { ENEMY_TYPE, LOCATION, ENEMY_SPAWN_EVENT } from '../../constants/Enums';
import { Timeout } from '../utils/Timeout';
import Renderer, { renderer } from '../render/Renderer';
import { currentScene } from '../../scenes/TutorialScene';

export default class EnemyManager {
    entry: Entry;
    alive: Phaser.Structs.Map<number, Enemy>;
    timeout: Timeout;

    // config var
    nbEnSmall = 0;
    nbRndMed = 0;
    spawnEventsEnemies: Phaser.Structs.Map<number, Enemy>;

    constructor(entry) {
        this.entry = entry;
        this.alive = new Phaser.Structs.Map<number, Enemy>([]);
        this.spawnEventsEnemies = new Phaser.Structs.Map<number, Enemy>([]);
    }

    spawnType = (type): Enemy | undefined => {
        let e;
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
        this.timeout = Timeout.every(15 * 100).do(() => {
            let e = this.spawnType(ENEMY_TYPE.SMALL);
            if (e) {
                e.goToGoal(0, 0, (en) => {
                    en.sprite.destroy();
                    this.alive.delete(en.id);
                });
                currentScene.events.emit(Enemy.ON_SPAWN, e);
            } else this.timeout.destroy();
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
        if (this.timeout) this.timeout.pause();
    }

    resume() {
        // console.log('resume enMana ' + this.entry.sign);
        this.makeAllDo((en) => en.resume());
        if (this.timeout) this.timeout.resume();
    }

    getClosestWithSign(sign, nb?: number): Enemy[] {
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