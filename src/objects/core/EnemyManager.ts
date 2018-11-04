import 'phaser';
import Enemy from '../character/Enemy';
import Entry from './Entry';
import { Cube } from 'phaser3-plugin-isometric/src/Cube';
import { Point3 } from 'phaser3-plugin-isometric/src/Point3';
import { ENEMY_TYPE, LOCATION, ENEMY_SPAWN_EVENT } from '../../constants/Enums';
import { Timeout } from '../utils/Timeout';
import { renderer } from '../render/Renderer';

export default class EnemyManager {
    entry: Entry;
    alive: Phaser.Structs.Map<number, Enemy>;
    timeout: Timeout;

    // config var
    nbEnSmall: number;
    nbRndMed: number;
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
        }
        return e;
    }

    getEnemyConfig(type) {
        let here = Cube
        let opEntry = this.entry.dest.getEntry(LOCATION.opposite(this.entry.location));
        let position = opEntry ? opEntry.getXYZLocation() : this.entry.getXYZLocation();
        //TODO figure out z with level.currentRoom.z;
        return {
            x: position.x,
            y: position.y,
            z: 0,
            texture: 'en_' + type + '_' + this.entry.sign.toLowerCase()
        }

    }

    spawnEvent(event) {

    }

    createMultiple(type, nb) {
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
        if (this.timeout) {
            this.makeAllDo((en) => en.resume());
            this.timeout.resume();
        } else {
            // start spawn small en
            // this.timeout = new Timeout(() => {
            //     let e = this.spawnType(ENEMY_TYPE.SMALL);
            //     let c = renderer.getCenterXYOfRoom(this.entry.source);
            //     if (e) {
            //         e.goToGoal(c.x, c.y,(en) => {
            //             en.sprite.destroy();
            //             this.alive.delete(en.id);
            //         });
            //     } else this.timeout.destroy();
            // }, true, 15 * 100, true);

            // start spawn med en
            let e = this.spawnType(ENEMY_TYPE.MEDIUM);
            let c = renderer.getCenterXYOfRoom(this.entry.source);
            e!.goToGoal(c.x, c.y, (en) => {
                this.killInstant(en,true);
            });
        }

    }

    update(time, delta) {
        for (let eId of this.alive.keys()) {
            if (this.alive.get(eId).isDead) {
                let rndE = this.spawnEventsEnemies.values()[Math.floor(Math.random() * this.spawnEventsEnemies.size)];
                if(this.spawnEventsEnemies.size>0) rndE.emitter.emit(ENEMY_SPAWN_EVENT.PREVIOUS_DIE.name,this);
                this.alive.delete(eId);
            }
        }
    }

    pause() {
        this.makeAllDo((en) => en.pause())
        this.timeout.pause();
    }

    getClosestWithSign(sign, nb?: number): Enemy[] {
        let ordered = this.alive.values().filter((en) => {
            //TODO in the future get with current sign is @param sign
            return true;
        }).sort((en1, en2) => Phaser.Math.Distance.Between(0, 0, en1.sprite.isoX, en1.sprite.isoY) - Phaser.Math.Distance.Between(0, 0, en2.sprite.isoX, en2.sprite.isoY));
        return ordered.splice(0, nb ? nb : 1);
    }

    killInstant(enemy: Enemy, playEvent = false) {
        console.log('killInstant');
        if (!playEvent) this.alive.delete(enemy.id);
        enemy.isDead = true;
        enemy.sprite.destroy();
        enemy.emitter.emit(Enemy.ON_DIE);
    }
}