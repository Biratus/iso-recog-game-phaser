import { DEFAULT_ROOM_CONFIG } from "../../constants/Constants";
import Entry from "./Entry";
import EnemyManager from "./EnemyManager";

export default class Room {

    _id: number;
    entries: Entry[];
    diff:number;
    constructor(id, diff) {
        this._id = id;
        this.diff=diff;
        this.entries = new Array();
    }

    get id() { return this._id };

    addEntry = (entry: Entry): void => {
        entry.source = this;
        this.entries.push(entry);
    }

    getEntry = (location: { x: number, y: number }): Entry | undefined => {
        for (let e of this.entries) if (location === e.location) return e;
        return;
    }

    getAllEnemiesManager = (): EnemyManager[] => this.entries.map(e => e.enemyManager);

    killEnemies(sign) {
        this.getAllEnemiesManager().forEach((enMana) => enMana.getClosestWithSign(sign).forEach((en)=>en.takeHit()));
    }
}