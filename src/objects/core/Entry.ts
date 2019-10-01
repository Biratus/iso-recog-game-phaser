import { ENEMY_TYPE } from "../../constants/Enums";
import EnemyManager from "./EnemyManager";
import Room from "./Room";
// import { MapRenderer } from "../render/MapRenderer";

export default class Entry {
    location: { x: number, y: number };
    destId: number;
    enemyManager: EnemyManager;
    source: Room;
    dest: Room;
    sign: string;
    diff: number;

    // enemies config
    nbEnSmall: number;
    nbEnMed: number;
    spawnEvtMed: any[] = [];

    constructor(Location, destId, sign, diff) {
        this.location = Location;
        this.destId = destId;
        this.sign = sign;
        this.diff = diff;
    }

    initEnemyManager() {
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.createMultiple(ENEMY_TYPE.SMALL, this.nbEnSmall);
        this.enemyManager.createMultiple(ENEMY_TYPE.MEDIUM, this.nbEnMed);
        for (let e of this.spawnEvtMed) this.enemyManager.createMultipleEvent(1, ENEMY_TYPE.MEDIUM,e);

    }
}