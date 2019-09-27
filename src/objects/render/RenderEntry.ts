import RenderRoom from "./RenderRoom";
import { IsoSprite } from 'phaser3-plugin-isometric';
import { RenderUtils } from "../utils/RenderUtils";
import { LOCATION } from "../../constants/Enums";
import { GameModule } from "../utils/GameUtils";
import { GAME_CONFIG } from "../../constants/Constants";
import Renderer from "./Renderer";

export default class RenderEntry {
    source: RenderRoom;
    dest: RenderRoom;
    sprite:IsoSprite;
    location;

    constructor(room: RenderRoom, loc) {
        let roomSpr = room.sprite;
        this.location=loc;
        let tile_width = RenderUtils.spriteIsoWidth(roomSpr);
        let canvasLoc = LOCATION.add({x:room.sprite.isoX,y:room.sprite.isoY},LOCATION.multiply(LOCATION[loc], tile_width / 2));
        let sprite = GameModule.currentScene.add.isoSprite(canvasLoc.x, canvasLoc.y, 0, Renderer.entryTextures[loc].texture);
        sprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
        sprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
        sprite.texture.source.forEach(src => src.resolution = 10);
        tile_width = RenderUtils.spriteIsoWidth(sprite);
        sprite.isoX += (tile_width / 2) * LOCATION[loc].x;
        sprite.isoY += (tile_width / 2) * LOCATION[loc].y;
        sprite.isoZ -= RenderUtils.spriteIsoHeight(sprite) / 2;
        sprite.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        this.sprite = sprite;
    }
}