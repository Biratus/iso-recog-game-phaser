import { DEFAULT_ROOM_CONFIG } from "../../constants/Constants";
import Entry from "./Entry";
import EnemyManager from "./EnemyManager";
import { LOCATION } from "../../constants/Enums";

export default class Room {

    _id: number;
    _entries: { [key: string]: Entry } = {};
    diff:number;
    constructor(id, diff) {
        this._id = id;
        this.diff=diff;
    }

    get id() { return this._id };

    addEntry = (entry: Entry): void => {
        entry.source = this;
        this._entries[LOCATION.name(entry.location)!]=entry;
    }

    getEntry = (location: { x: number, y: number }): Entry => {
        return this._entries[LOCATION.name(location)!];
    }

    getAllEnemiesManager = (): EnemyManager[] => this.entries().filter(e => e.enemyManager).map(e => e.enemyManager);

    killEnemies(sign) {
        this.getAllEnemiesManager().forEach((enMana) => enMana.getClosestWithSign(sign).forEach((en)=>en.takeHit()));
    }

    entries():Entry[] {
        let e:Entry[]=[];
        for(let l of LOCATION.enum()){
            let en = this._entries[l];
            if(en) e.push(en);
        }
        return e;
    }

}