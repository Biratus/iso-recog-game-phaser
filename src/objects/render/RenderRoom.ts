import { MapRenderer } from './MapRenderer';
import { DEFAULT_ROOM_CONFIG } from '../../constants/Constants';
import Room from '../core/Room';
import Tile from './Tile';

export default class RenderRoom {
    static tileTexture = 'cube_blue';
    static entryTileTexture = 'abstractTile_09';
    static originTexture = 'cube_gray.png';
    room: Room;
    tileKey: string;
    tiles: Tile[] = [];
    _position: { x: number, y: number, z: number };
    _isBuild = false;
    _drawSide = false;
    constructor(config) {
        this.room = config.room;
        this.tileKey = config.key || DEFAULT_ROOM_CONFIG.key;
        this._position = {
            "x": config.x, "y": config.y, "z": config.z
        }
    }

    build(): void {
        if (this._isBuild) return;
        this._isBuild = true;
        //some variables
        let size = DEFAULT_ROOM_CONFIG.block_size;
        let start_x = this._position.x + Math.ceil(-size / 2);
        let end_x = this._position.x + Math.ceil(size / 2);
        let start_y = this._position.y + Math.ceil(-size / 2);
        let end_y = this._position.y + Math.ceil(size / 2);

        for (let x = start_x; x < end_x; x++) {
            for (let y = start_y; y < end_y; y++) {
                if (this._drawSide) {
                    if ((x == start_x || x == end_x - 1) && !this.isEntry(x, y)) this.tiles.push(MapRenderer.setTileAt(x, y, this._position.z + 1, RenderRoom.tileTexture));//sideX
                    else if ((y == start_y || y == end_y - 1) && !this.isEntry(x, y)) this.tiles.push(MapRenderer.setTileAt(x, y, this._position.z + 1, RenderRoom.tileTexture));//sideY
                }
                if (x == 0 && y == 0) this.tiles.push(MapRenderer.setTileAt(x, y, this._position.z, 'cube_gray'));
                // let z = this._position.z;
                else this.tiles.push(MapRenderer.setTileAt(x, y, this._position.z, RenderRoom.tileTexture));
            }
        }
    }

    isEntry(x: number, y: number): boolean {
        let hSize = Math.ceil(DEFAULT_ROOM_CONFIG.block_size / 2) - 1;
        let relX = (x - this._position.x) / hSize;
        let relY = (y - this._position.y) / hSize;
        for (let entry of this.room.entries) {
            if (entry.location.x == relX && entry.location.y == -relY) return true;
        }
        return false;
    }

    getBorderTiles = (): Tile[] => {
        let size = DEFAULT_ROOM_CONFIG.block_size;
        let end_x = this._position.x + Math.ceil(size / 2);
        let end_y = this._position.y + Math.ceil(size / 2);
        return this.tiles.filter((tile) => (tile.x == end_x-1 || tile.y == end_y-1));
    }
}