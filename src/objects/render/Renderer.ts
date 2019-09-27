import { IsoSprite } from 'phaser3-plugin-isometric';
import { GAME_CONFIG } from "../../constants/Constants";
// import MapManager, { MapRenderer } from "./MapRenderer";
import { EVENTS, LOCATION } from "../../constants/Enums";
import { GameModule } from "../utils/GameUtils";
import { RenderUtils } from "../utils/RenderUtils";
import MapUtils from '../utils/MapUtils';
import RenderEntry from './RenderEntry';
import RenderRoom from './RenderRoom';

class IsoGroup {
    prevX: number | undefined = undefined; prevY: number | undefined = undefined;
    children: IsoSprite[] = [];
    tween: Phaser.Tweens.Tween;

    constructor() { }

    set x(val) {
        if (this.prevX !== undefined) {
            for (let c of this.children) {
                c.isoX += val - this.prevX!;
            }
        }
        this.prevX = val;
    }
    set y(val) {
        if (this.prevY !== undefined) {
            for (let c of this.children) {
                c.isoY += val - this.prevY!;
            }
        }
        this.prevY = val;
    }
    get x() { this.prevX = undefined; return 0; }
    get y() { this.prevY = undefined; return 0; }
}

export default class Renderer {
    static entryTexture = 'CLASSIC_blue_1,3,5';
    static entryTextures = {
        'TOP': { texture: 'CLASSIC_w1_Z0.5_olighterdarker_out' },
        'BOTTOM': { texture: 'CLASSIC_w1_Z0.5_olighterdarker_in' },
        'LEFT': { texture: 'CLASSIC_w1_Z0.5_olightermedium_out' },
        'RIGHT': { texture: 'CLASSIC_w1_Z0.5_olightermedium_in' },
    }
    static roomTexture = 'CLASSIC_Elongated_w1_Z1o_mediumdarker';
    static playerTexture = 'plyer';
    static entryOffset = 4.5;

    group = new IsoGroup();

    terrainContainer: Phaser.GameObjects.Container;
    characterContainer: Phaser.GameObjects.Container;
    terrainOverlayContainer: Phaser.GameObjects.Container;
    rendererContainer: Phaser.GameObjects.Container;
    uiContainer: Phaser.GameObjects.Container;

    spriteInitialized = false;
    debug = false;

    rooms:{[key:number]: RenderRoom};

    constructor() {
        this.terrainContainer = GameModule.currentScene.add.container(0, 0);
        this.characterContainer = GameModule.currentScene.add.container(0, 0);
        this.terrainOverlayContainer = GameModule.currentScene.add.container(0, 0);
        this.uiContainer = GameModule.currentScene.add.container(0, 0);
        this.rendererContainer = GameModule.currentScene.add.container(0, 0);
        this.rendererContainer.add(this.terrainContainer);
        this.rendererContainer.add(this.characterContainer);
        this.rendererContainer.add(this.terrainOverlayContainer);
        // this.rendererContainer.add(this.uiContainer);
    }

    all(func) {this.terrainContainer.each(func);}

    update(time, delta) {
        this.terrainContainer.sort('depth');
    }

    isEmpty() {
        return MapUtils.of(this.rooms).length()==0;
    }

    addRoom(entry?:RenderEntry):RenderRoom {
        let room;
        if(entry) {
            let loc = RenderUtils.getLocRoomOpposite(entry);
            room = new RenderRoom(loc.x,loc.y,0,Renderer.roomTexture);
        } else {
            room = new RenderRoom(0,0,0,Renderer.roomTexture);
        }
        this.terrainContainer.add(room.sprite);
        return room;
    }

    addEntry(room,loc):RenderEntry {
        let entry = new RenderEntry(room,loc);
        room.addEntry(entry);
        this.terrainContainer.add(entry.sprite);
        return entry;
    }

    /*renderRoom = (room: Room) => {
       
        for (let loc of LOCATION.enum()) {
            //render sprite with entry texture
            let sprite = this.currentEntriesSprite[loc];
            let tile_width = RenderUtils.spriteIsoWidth(this.currentRoomSprite);
            let canvasLoc = LOCATION.multiply(LOCATION[loc], tile_width / 2);
            tile_width = RenderUtils.spriteIsoWidth(sprite);
            sprite.isoX = canvasLoc.x + (tile_width / 2) * LOCATION[loc].x - LOCATION[loc].x * Renderer.entryOffset * GAME_CONFIG.scale;
            sprite.isoY = canvasLoc.y + (tile_width / 2) * LOCATION[loc].y - LOCATION[loc].y * Renderer.entryOffset * GAME_CONFIG.scale;
            if (room.getEntry(LOCATION[loc])) sprite.visible = true;
            else sprite.visible = false;
        }

    }

    private initSpritesRoom = () => {
        //current Room
        this.currentRoomSprite = GameModule.currentScene.add.isoSprite(0, 0, 0, Renderer.roomTexture);
        this.currentRoomSprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        this.currentRoomSprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        this.currentRoomSprite.isoZ -= RenderUtils.spriteIsoHeight(this.currentRoomSprite) / 2;
        this.currentRoomSprite.texture.source.forEach(src => src.resolution = 100);
        //current Entries
        this.currentEntriesSprite = {};
        for (let loc of LOCATION.enum()) {
            let tile_width = RenderUtils.spriteIsoWidth(this.currentRoomSprite);
            let canvasLoc = LOCATION.multiply(LOCATION[loc], tile_width / 2);
            let sprite = GameModule.currentScene.add.isoSprite(canvasLoc.x, canvasLoc.y, 0, Renderer.entryTextures[loc].texture);
            sprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
            sprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
            sprite.texture.source.forEach(src => src.resolution = 10);
            tile_width = RenderUtils.spriteIsoWidth(sprite);
            sprite.isoX += (tile_width / 2) * LOCATION[loc].x - LOCATION[loc].x * 100;
            sprite.isoY += (tile_width / 2) * LOCATION[loc].y - LOCATION[loc].y * 100;
            sprite.isoZ -= RenderUtils.spriteIsoHeight(sprite) / 2;
            sprite.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
            sprite.on('pointerdown', () => this.emitter.emit(EVENTS.ENTRY_CLICK, loc));
            this.currentEntriesSprite[loc] = sprite;
        }
        //current Room Transition
        this.currentRoomTransitionSprite = GameModule.currentScene.add.isoSprite(0, 0, 0, Renderer.roomTexture);
        this.currentRoomTransitionSprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        this.currentRoomTransitionSprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        this.currentRoomTransitionSprite.isoZ -= RenderUtils.spriteIsoHeight(this.currentRoomSprite) / 2;
        this.currentRoomTransitionSprite.texture.source.forEach(src => src.resolution = 10);
        this.currentRoomTransitionSprite.visible = false;
        // this.currentRoomTransitionSprite.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);
        //current Entries Transition
        this.currentEntriesTransitionSprite = {};
        for (let loc of LOCATION.enum()) {
            let tile_width = RenderUtils.spriteIsoWidth(this.currentRoomSprite);
            let canvasLoc = LOCATION.multiply(LOCATION[loc], tile_width / 2);
            let sprite = GameModule.currentScene.add.isoSprite(canvasLoc.x, canvasLoc.y, 0, Renderer.entryTextures[loc].texture);
            sprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
            sprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
            sprite.texture.source.forEach(src => src.resolution = 10);
            tile_width = RenderUtils.spriteIsoWidth(sprite);
            sprite.isoX += (tile_width / 2) * LOCATION[loc].x;
            sprite.isoY += (tile_width / 2) * LOCATION[loc].y;
            sprite.isoZ -= RenderUtils.spriteIsoHeight(sprite) / 2;
            sprite.visible = false;
            sprite.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
            sprite.on('pointerdown', () => this.emitter.emit(EVENTS.ENTRY_CLICK, loc));
            this.currentEntriesTransitionSprite[loc] = sprite;
        }
    }

    private getRoomLocAt(entry?: Entry): { x: number, y: number } | undefined {
        if (!entry) return undefined;
        let w = RenderUtils.spriteHalfIsoWidth(this.currentRoomSprite) + RenderUtils.spriteHalfIsoWidth(this.currentRoomTransitionSprite) +
            RenderUtils.spriteIsoWidth(this.currentEntriesTransitionSprite[LOCATION.name(LOCATION.opposite(entry.location))!])
            + RenderUtils.spriteIsoWidth(this.currentEntriesSprite[LOCATION.name(entry.location)!])
        return LOCATION.multiply(entry.location, w);
    }

    getAllSprites(): IsoSprite[] {
        let sprs: IsoSprite[] = [];
        sprs.push(this.currentRoomSprite);
        sprs.push(this.currentRoomTransitionSprite);
        for (let l of LOCATION.enum()) {
            sprs.push(this.currentEntriesSprite[l]);
            sprs.push(this.currentEntriesTransitionSprite[l]);
        }
        return sprs;
    }*/

    static init() { renderer = new Renderer(); }
}
export var renderer: Renderer;