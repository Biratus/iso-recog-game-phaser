import { currentScene } from "../../scenes/GameScene";
import { GAME_CONFIG } from "../../constants/Constants";
import MapManager, { MapRenderer } from "./MapRenderer";
import { LOCATION } from "../../constants/Enums";
import { IsoSprite } from 'phaser3-plugin-isometric';
import Level from "../core/Level";
import Room from "../core/Room";
import RenderRoom from "./RenderRoom";

export var renderer: Renderer;

export default class Renderer {
    static _hasBeenInit = false;
    children: IsoSprite[];
    mapManager: MapManager;
    constructor() {
        this.children = [];
        this.mapManager = new MapManager(this);
    }

    static init(): void {
        if (Renderer._hasBeenInit) return;
        Renderer._hasBeenInit = true;
        renderer = new Renderer();
    }

    add = (x, y, z, texture, frame): IsoSprite => {
        let sprite = currentScene.add.isoSprite(x, y, z, texture, frame);
        sprite.scaleY = GAME_CONFIG.scale;
        sprite.scaleX = GAME_CONFIG.scale;
        this.children.push(sprite);
        return sprite;
    }

    renderLevel = (level: Level): void => {
        let currLoc = { x: 0, y: 0, z: 0 };
        let renderedRoom: number[] = [];

        renderedRoom.push(level.start.id);
        this.mapManager.addRoom(currLoc.x, currLoc.y, currLoc.z, 'tile_0' + level.start.id, level.start);

        for (let e of level.start.entries) {
            let nLoc = LOCATION.add(e.location, currLoc);
            if (renderedRoom.indexOf(e.destId) < 0) this.renderRoom(renderedRoom, e.dest, nLoc);
        }

        this.mapManager.buildRooms();
    }

    renderRoom = (rendered: number[], room: Room, loc: { x: number, y: number, z: number }): void => {
        rendered.push(room.id);
        let r = this.mapManager.addRoom(loc.x, loc.y, loc.z, 'tile_0' + room.id, room);

        if (room.entries.length <= 1) return;

        for (let e of room.entries) {
            let nLoc = LOCATION.add(e.location, loc);
            if (LOCATION.isOrigin(nLoc)) continue;//entry of previous room

            if (rendered.indexOf(e.destId) < 0) this.renderRoom(rendered, e.dest, nLoc);
        }
    }

    getCenterXYOfRoom(room: Room): { x: number, y: number } {
        let r = this.mapManager.rooms.filter((val) => val.room.id === room.id);
        if (!r) console.error('Cannot find room ' + [room.id], room);
        return {
            x: r[0]._position.x,
            y: r[0]._position.y
        }
    }

    getCenterXYZOfRoom(room: Room): { x: number, y: number, z: number } {
        let r = this.mapManager.rooms.filter((val) => val.room.id === room.id);
        if (!r) console.error('Cannot find room ' + [room.id], room);
        return {
            x: r[0]._position.x,
            y: r[0]._position.y,
            z: r[0]._position.z
        }
    }
    getRenderRoom(room: Room): RenderRoom | undefined {
        let r = this.mapManager.rooms.filter((val) => val.room.id === room.id);
        return r.length > 0 ? r[0] : undefined;
    }

    addGroundLayer(x, y, z, texture, frame?): IsoSprite {
        let sprite = this.add(x, y, z, texture, frame);
        sprite.scaleX *= GAME_CONFIG.tile_scale;
        sprite.scaleY *= GAME_CONFIG.tile_scale;
        return sprite;
    }

    addCharacterLayer = (x, y, z, texture, frame?): void => this.add(x, y, z + GAME_CONFIG.scale * GAME_CONFIG.tile_height / 2, texture, frame);

    buildUnderground() {
        let height=0.5;
        let z=-1;
        let texture='cube_gray_h0.5';
        this.mapManager.rooms.forEach((room) => {
            for(let t of room.getBorderTiles()) {
                let addedTile=MapRenderer.setTileAt(t.x,t.y,z+height/2,texture);
                
            }
        });
    }

    hideRooms() {
        this.mapManager.rooms.forEach((room)=> {
            for(let t of room.tiles) t.sprite.visible=false;
        })
    }
}