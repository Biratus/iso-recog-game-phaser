import { LOCATION, EVENTS } from "../../constants/Enums";
import EnemyManager from "./EnemyManager";
import Entry from "./Entry";

export default class Room {

    _id: number;
    _entries: { [key: string]: Entry } = {};
    diff: number;
    enemyKilledSinceBegining=0;

    combo = 1;

    constructor(id, diff) {
        this._id = id;
        this.diff = diff;
    }

    update(time,delta) {
        let totEnKilled = this.getAllEnemiesManager().reduce((acc,enMana) => acc+=enMana.someData.enemyKilledSinceBegining,0);
        if(totEnKilled>this.enemyKilledSinceBegining) {
            for(let i=this.enemyKilledSinceBegining;i<totEnKilled;i++) {
                this.getAllEnemiesManager().forEach((enMana) => enMana.eventListener.emit(EVENTS.ENEMY_KILLED+i))
            }
        }
    }

    get id() { return this._id };

    addEntry = (entry: Entry): void => {
        entry.source = this;
        this._entries[LOCATION.name(entry.location)!] = entry;
    }

    getEntry = (location: { x: number, y: number }): Entry => {
        return this._entries[LOCATION.name(location)!];
    }

    getAllEnemiesManager = (): EnemyManager[] => this.entries().filter(e => e.enemyManager).map(e => e.enemyManager);

    killEnemies(sign) {
        this.getAllEnemiesManager().forEach((enMana) => enMana.getClosestWithSign(sign).forEach((en) => en.takeHit()));
    }

    entries(): Entry[] {//Map to List
        let e: Entry[] = [];
        for (let l of LOCATION.enum()) {
            let en = this._entries[l];
            if (en) e.push(en);
        }
        return e;
    }

}