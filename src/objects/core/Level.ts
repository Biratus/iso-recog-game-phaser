import Room from "./Room";

export default class Level {
    name: string;
    _start: number;
    _finish: number;
    rooms: Phaser.Structs.Map<number, Room>;
    start: Room;
    finish: Room;
    currentRoom: Room;
    constructor(name, start, finish) {
        this.name = name;
        this._start = start;
        this._finish = finish;
        this.rooms = new Phaser.Structs.Map([]);
    }

    preload() {
        this.start = this.rooms.get(this._start);
        this.currentRoom = this.start;
        this.finish = this._finish ? this.rooms[this._finish] : null;
        for (let r of this.rooms.values()) {
            for (let e of r.entries()) {
                e.dest = this.rooms.get(e.destId);
                if (!e.dest) console.error('[ERROR] undefined room with id (' + e.destId + ') for level', this);
            }
        }
    }

    create() {
        for (let e of this.start.entries()) {
            e.initEnemyManager();
        }
    }

    addRoom(r): void {
        this.rooms.set(r.id, r);
    }

    update(time, delta) {
        this.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.update(time, delta));
    }

}