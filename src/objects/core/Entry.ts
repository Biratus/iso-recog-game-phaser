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

    constructor(location, destId, sign, diff) {
        this.location = location;
        this.destId = destId;
        this.sign = sign;
        this.diff = diff;
        //renderer.add(this._position.x, this._position.y, this._position.z,'platformerTile_01');
    }

    initEnemyManager() {
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.createMultiple(ENEMY_TYPE.SMALL, this.nbEnSmall);
        for (let e of this.spawnEvtMed) this.enemyManager.createMultipleMed(1, e);
        this.enemyManager.createMultiple(ENEMY_TYPE.MEDIUM, this.nbEnMed - this.spawnEvtMed.length);

    }

    // getXYZLocation(): { x: number, y: number, z: number } {
    //     const rr = renderer.getRenderRoom(this.source);
    //     const rPos = {
    //         x: rr!._position.x,
    //         y: rr!._position.y,
    //         z: rr!._position.z
    //     }
    //     const t = MapRenderer.getTileAt(
    //         rPos.x + this.location.x * Math.floor(DEFAULT_ROOM_CONFIG.block_size / 2),
    //         rPos.y + this.location.y * Math.floor(DEFAULT_ROOM_CONFIG.block_size / 2),
    //         rPos.z);
    //     return {
    //         x: t!.sprite.isoX,
    //         y: t!.sprite.isoY,
    //         z: t!.sprite.isoZ,
    //     }
    // }

}