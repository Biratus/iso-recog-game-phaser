import { _ } from 'underscore';
import { IsoSprite } from 'phaser3-plugin-isometric';
import { GAME_CONFIG } from '../../constants/Constants';

export default class Tile {
    sprite: IsoSprite;
    _position: { x: number, y: number, z: number };
    _neighbours: {
        north: Tile | undefined,//y+1
        south: Tile | undefined,//y-1
        west: Tile | undefined,//x-1,
        east: Tile | undefined,//x+1
        down: Tile | undefined,//z-1
        up: Tile | undefined//z+1
    } = { north: undefined, south: undefined, west: undefined, east: undefined, down: undefined, up: undefined };

    constructor(x, y, z, sprite) {
        this.sprite = sprite;
        this._position = { 'x': x, 'y': y, 'z': z };
        _.reduce(this._neighbours, (acc, key, val) => acc += '\n' + key + " : " + val, '');
    }

    set x(nx: number) {
        this._position.x = nx;
        this.sprite.isoPosition.x = nx * GAME_CONFIG.tile_size;
    }
    set y(ny: number) {
        this._position.y = ny;
        this.sprite.isoPosition.y = ny * GAME_CONFIG.tile_size;
    }
    set z(nz: number) {
        this._position.z = nz;
        this.sprite.isoPosition.x = nz * GAME_CONFIG.tile_height;
    }

    get x() { return this._position.x; }
    get y() { return this._position.y; }
    get z() { return this._position.z; }

    setNext(direction, nextTile) {
        if (this._neighbours[direction] === undefined)
            console.error(direction + " is not a position relative to this tile.\nPositions: \n" +
                _.reduce(this._neighbours, (acc, key, val) => acc += '\n    ' + key + " : " + val, ''));
        else
            this._neighbours[direction] = nextTile;
    }
    getNext(direction): Tile {
        if (this._neighbours[direction] === undefined)
            throw direction + " is not a position relative to this tile.\nPositions: \n" +
            _.reduce(this._neighbours, (acc, key, val) => acc += '\n    ' + key + " : " + val, '');
        else return this._neighbours[direction];
    }

    destroy() {
        this.sprite.destroy();
    }
}