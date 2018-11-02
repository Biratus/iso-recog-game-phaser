import 'phaser';
import Enemy from '../character/Enemy';
import Entry from './Entry';
import { ENEMY_TYPE, LOCATION } from '../../constants/Enums';
import { Timeout } from '../utils/Timeout';
import { renderer } from '../render/Renderer';

export default class EnemyManager {
    entry: Entry;
    alive: Phaser.Structs.Map<number, Enemy>;
    nbEnSmall: number;
    timeout: Timeout;

    constructor(entry) {
        this.entry = entry;
        this.alive = new Phaser.Structs.Map<number, Enemy>([]);
    }

    spawnType = (type): Enemy | undefined => {
        let opEntry = this.entry.dest.getEntry(LOCATION.opposite(this.entry.location));
        let position = opEntry ? opEntry.getXYZLocation() : this.entry.getXYZLocation();
        let e;
        switch (type) {
            case ENEMY_TYPE.SMALL:
                if (this.nbEnSmall <= 0) return;
                this.nbEnSmall--;
                //TODO figure out z with level.currentRoom.z;
                e = new Enemy({
                    x: position.x,
                    y: position.y,
                    z: 0,
                    texture: 'en_' + type + '_' + this.entry.sign.toLowerCase()
                },type);

                this.alive.set(e.id, e);
                break;
        }
        return e;
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

    makeAllDo = (behavior: (e: Enemy) => void) => {
        return this.alive.values().forEach(behavior);
    }

    start() {
        if (this.timeout) {
            this.makeAllDo((en) => en.resume());
            this.timeout.resume();
        } else {
            this.timeout = new Timeout(() => {
                let e = this.spawnType(ENEMY_TYPE.SMALL);
                let c = renderer.getCenterXYOfRoom(this.entry.source);
                if (e) {
                    e.goToGoal(c.x, c.y,(en) => {
                        en.sprite.destroy();
                        this.alive.delete(en.id);
                    });
                } else this.timeout.destroy();
            }, true, 15 * 100, true);
        }

    }

    pause() {
        this.makeAllDo((en) => en.pause())
        this.timeout.pause();
    }

    getClosestWithSign(sign,nb?:number):Enemy[] {
        let ordered = this.alive.values().filter((en)=>{
            //TODO in the future get with current sign is @param sign
            return true;
        }).sort((en1,en2)=>Phaser.Math.Distance.Between(0,0,en1.sprite.isoX,en1.sprite.isoY)-Phaser.Math.Distance.Between(0,0,en2.sprite.isoX,en2.sprite.isoY));
        return ordered.splice(0,nb?nb:1);
    }
}