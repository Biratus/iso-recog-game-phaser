import Enemy from '../character/Enemy';
import Entry from './Entry';

export default class EnemyManager {
    entry:Entry;
    alive:Array<Enemy>;
    constructor(entry) {
        this.entry=entry;
        this.alive = new Array<Enemy>();
    }

    spawn = ():Enemy => {
        const position = this.entry.location;
        //TODO figure out z with level.currentRoom.z;
        let e = new Enemy(position.x,position.y,1,'platformerTile_17');

        this.alive.push(e);
        return e;
    }

    makeAllDo = (behavior:() => {}) => {
        return this.alive.forEach(behavior);
    }
}