import 'phaser'
import Map3D from './Map3D';
import { DEFAULT_ROOM_CONFIG } from '../../constants/Constants';
import RenderRoom from './RenderRoom';
import Room from '../core/Room';
import Entry from '../core/Entry';

export var MapRenderer:Map3D;

export default class MapManager {
    scene:Phaser.Scene;
    rooms:RenderRoom[];
    // entries:Entry[];
    constructor(scene) {
        this.scene = scene;
        MapRenderer = new Map3D(scene);
        this.rooms = new Array();
        // this.entries = new Array();
    }

    addRoom(x, y, z, key, room):RenderRoom {
        let room_length = Math.floor(DEFAULT_ROOM_CONFIG.block_size);
        let r = new RenderRoom({
            'x': x * room_length, 'y': y * room_length, 'z': z, 'key': key, 'room': room
        });
        this.rooms.push(r);
        return r;
    }

    buildRooms():void {
        for (let r of this.rooms) r.build();
    }

    move(x, y, z):void {
        x = x || 0;
        y = y || 0;
        z = z || 0;

        MapRenderer.move(x, y, z);
    }

}