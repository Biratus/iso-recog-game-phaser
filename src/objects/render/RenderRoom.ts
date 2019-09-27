import RenderEntry from "./RenderEntry";
import { IsoSprite } from 'phaser3-plugin-isometric';
import { GameModule } from "../utils/GameUtils";
import { GAME_CONFIG } from "../../constants/Constants";
import { RenderUtils } from "../utils/RenderUtils";

export default class RenderRoom {
    static idCount = 0;

    _id: number;
    _entries: { [key: string]: RenderEntry } = {};
    sprite:IsoSprite

    constructor(x, y, z, texture) {
        this._id = RenderRoom.idCount;
        RenderRoom.idCount++;
        let roomSpr = GameModule.currentScene.add.isoSprite(x, y, z, texture);
        roomSpr.scaleY = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        roomSpr.scaleX = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        roomSpr.isoZ -= RenderUtils.spriteIsoHeight(roomSpr) / 2;
        roomSpr.texture.source.forEach(src => src.resolution = 100);
        roomSpr.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        this.sprite = roomSpr;
    }
    get id() { return this._id };
    set id(id) {this._id=id;if(RenderRoom.idCount<id) RenderRoom.idCount=id+1;}
    hasEntry(loc) {
        return this._entries[loc] != undefined;
    }

    addEntry(entry:RenderEntry) {
        this._entries[entry.location]=entry;
    }

    on(key,func) {this.sprite.on(key,func);}
}