import Room from "./Room";

export default class Level {
    name:string;
    _start:number;
    _finish:number;
    rooms:Phaser.Structs.Map<number,Room>;
    start:Room;
    finish:Room;
    currentRoom:Room;
    constructor(name,start,finish) {
        this.name=name;
        this._start=start;
        this._finish=finish;
        this.rooms=new Phaser.Structs.Map([]);
    }

    init():void {
        this.start = this.rooms.get(this._start);
        this.currentRoom = this.start;
        this.finish = this._finish?this.rooms[this._finish]:null;
        for(let r of this.rooms.values()) {
            for(let e of r.entries) {
                if(r._id === this._start) e.initEnemyManager();
                e.dest=this.rooms.get(e.destId);
                if(!e.dest) console.error('[ERROR] undefined room with id ('+e.destId+') for level',this);
            }
        }
    }

    addRoom(r):void {
        this.rooms.set(r.id,r);
    }

}