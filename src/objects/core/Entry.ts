import { GAME_CONFIG } from "../../constants/Constants";
import EnemyManager from "./EnemyManager";
import { currentScene } from "../../scenes/GameScene";
import { renderer } from "../render/Renderer";
import Room from "./Room";
import Enemy from "../character/Enemy";

export default class Entry {
    location: { x: number, y: number };
    destId: number;
    enemyManager: EnemyManager;
    source: Room;
    dest:Room;
    constructor(location, destId) {
        this.location = location;
        this.destId = destId;
        this.enemyManager = new EnemyManager(this);
        //renderer.add(this._position.x, this._position.y, this._position.z,'platformerTile_01');
    }

    spawn = ():Enemy => {
        return this.enemyManager.spawn();
    }

}