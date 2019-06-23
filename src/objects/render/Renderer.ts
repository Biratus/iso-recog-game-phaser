import { currentScene } from "../../scenes/GameScene";
import { GAME_CONFIG } from "../../constants/Constants";
// import MapManager, { MapRenderer } from "./MapRenderer";
import { LOCATION } from "../../constants/Enums";
import { IsoSprite } from 'phaser3-plugin-isometric';
import Level from "../core/Level";
import Room from "../core/Room";
import { RenderUtils } from "../utils/RenderUtils";
import { LevelUtils } from "../utils/LevelUtils";
import Entry from "../core/Entry";

class IsoGroup {
    prevX: number | undefined = undefined; prevY: number | undefined = undefined;
    children: IsoSprite[] = [];

    constructor() { }

    set x(val) {
        if (this.prevX != null) {
            for (let c of this.children) {
                c.isoX += val - this.prevX!;
            }
        }
        this.prevX = val;
    }
    set y(val) {
        if (this.prevY != null) {
            for (let c of this.children) {
                c.isoY += val - this.prevY!;
            }
        }
        this.prevY = val;
    }
    get x() { return 0; }
    get y() { return 0; }
}

export default class Renderer {
    static entryTexture = 'CLASSIC_blue_1,3,5';
    static roomTexture = 'CLASSIC_blue_1,3,5_Elongated _w1_Z0.5';

    group = new IsoGroup();
    currentRoomSprite: IsoSprite;
    currentEntriesSprite: { [key: string]: IsoSprite };
    currentRoomTransitionSprite: IsoSprite;
    currentEntriesTransitionSprite: { [key: string]: IsoSprite };

    constructor() {}

    renderRoom = (room: Room) => {
        this.initSprites();
        //render current room sprite with room texture
        for (let loc of LOCATION.enum()) {
            //render sprite with entry texture
            if (room.getEntry(LOCATION[loc])) this.currentEntriesSprite[loc].visible = true;
            else this.currentEntriesSprite[loc].visible = false;
        }

    }

    private initSprites = () => {
        if (!this.currentRoomSprite) {
            this.currentRoomSprite = currentScene.add.isoSprite(0, 0, 0, Renderer.roomTexture);
            this.currentRoomSprite.scaleY = GAME_CONFIG.scale;
            this.currentRoomSprite.scaleX = GAME_CONFIG.scale;
            this.currentRoomSprite.isoZ -= RenderUtils.spriteIsoHeight(this.currentRoomSprite) / 2;
            this.currentRoomSprite.texture.source.forEach(src => src.resolution = 10);
        }
        if (!this.currentEntriesSprite) {
            this.currentEntriesSprite = {};
            for (let loc of LOCATION.enum()) {
                let tile_width = RenderUtils.spriteIsoWidth(this.currentRoomSprite);
                let canvasLoc = LOCATION.multiply(LOCATION[loc], tile_width / 2);
                let sprite = currentScene.add.isoSprite(canvasLoc.x, canvasLoc.y, 0, Renderer.entryTexture);
                sprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.tile_scale;
                sprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.tile_scale;
                sprite.texture.source.forEach(src => src.resolution = 10);
                tile_width = RenderUtils.spriteIsoWidth(sprite);
                sprite.isoX += (tile_width / 2) * LOCATION[loc].x;
                sprite.isoY += (tile_width / 2) * LOCATION[loc].y;
                sprite.isoZ -= RenderUtils.spriteIsoHeight(sprite) / 2;
                this.currentEntriesSprite[loc] = sprite;
            }
        }
        if (!this.currentRoomTransitionSprite) {
            this.currentRoomTransitionSprite = currentScene.add.isoSprite(0, 0, 0, Renderer.roomTexture);
            this.currentRoomTransitionSprite.scaleY = GAME_CONFIG.scale;
            this.currentRoomTransitionSprite.scaleX = GAME_CONFIG.scale;
            this.currentRoomTransitionSprite.isoZ -= RenderUtils.spriteIsoHeight(this.currentRoomSprite) / 2;
            this.currentRoomTransitionSprite.texture.source.forEach(src => src.resolution = 10);
            this.currentRoomTransitionSprite.visible = false;
        }
        if (!this.currentEntriesTransitionSprite) {
            this.currentEntriesTransitionSprite = {};
            for (let loc of LOCATION.enum()) {
                let tile_width = RenderUtils.spriteIsoWidth(this.currentRoomSprite);
                let canvasLoc = LOCATION.multiply(LOCATION[loc], tile_width / 2);
                let sprite = currentScene.add.isoSprite(canvasLoc.x, canvasLoc.y, 0, Renderer.entryTexture);
                sprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.tile_scale;
                sprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.tile_scale;
                sprite.texture.source.forEach(src => src.resolution = 10);
                tile_width = RenderUtils.spriteIsoWidth(sprite);
                sprite.isoX += (tile_width / 2) * LOCATION[loc].x;
                sprite.isoY += (tile_width / 2) * LOCATION[loc].y;
                sprite.isoZ -= RenderUtils.spriteIsoHeight(sprite) / 2;
                sprite.visible = false;
                this.currentEntriesTransitionSprite[loc] = sprite;
            }
        }
        this.group.children = this.getAllSprites();
    }

    renderTransition = (source: Room, dest: Room) => {
        //check with source texture
        if (!this.currentRoomSprite || this.currentRoomSprite.key != Renderer.roomTexture) {
            this.renderRoom(source);
        }
        //TODO change all texture according to dest
        // this.currentRoomTransitionSprite.texture=


        let loc = this.getRoomLocAt(LevelUtils.entryBetween(source, dest));
        if (!loc) return;
        this.renderRoomTransition(dest, loc);

        currentScene.tweens.add({
            targets: this.group,
            x: -this.currentRoomTransitionSprite.isoX,
            y: -this.currentRoomTransitionSprite.isoY,
            duration: 4000,
            ease: Phaser.Math.Easing.Quadratic.InOut,
            delay: 0,
            onComplete: () => renderer.animComplete()
        });

    }

    private getRoomLocAt(entry?: Entry): { x: number, y: number } | undefined {
        if (!entry) return undefined;
        let w = RenderUtils.spriteHalfIsoWidth(this.currentRoomSprite) + RenderUtils.spriteHalfIsoWidth(this.currentRoomTransitionSprite) +
            RenderUtils.spriteIsoWidth(this.currentEntriesTransitionSprite[LOCATION.name(LOCATION.opposite(entry.location))!])
            + RenderUtils.spriteIsoWidth(this.currentEntriesSprite[LOCATION.name(entry.location)!])
        return LOCATION.multiply(entry.location, w);
    }

    private renderRoomTransition(room: Room, loc: { x: number, y: number }) {
        this.getTransitionSpites().forEach(spr => spr.shouldAppear=false);
        this.currentRoomTransitionSprite.isoX = loc.x;
        this.currentRoomTransitionSprite.isoY = loc.y;
        this.currentRoomTransitionSprite.shouldAppear=true;
        for (let entry of room.entries()) {
            let entrySpr = this.currentEntriesTransitionSprite[LOCATION.name(entry.location)!];
            let newLoc = LOCATION.add(loc,
                LOCATION.multiply(entry.location, RenderUtils.spriteHalfIsoWidth(this.currentRoomTransitionSprite) + RenderUtils.spriteHalfIsoWidth(entrySpr)));
            entrySpr.isoX = newLoc.x;
            entrySpr.isoY = newLoc.y;
            entrySpr.shouldAppear=true;
        }
        setTimeout(() => this.getTransitionSpites().filter(spr => spr.shouldAppear).forEach(spr => spr.visible=true), 10);
    }

    swap() {
        let t = this.currentRoomSprite;
        this.currentRoomSprite = this.currentRoomTransitionSprite;
        this.currentRoomTransitionSprite = t;
        let i = this.currentEntriesSprite;
        this.currentEntriesSprite = this.currentEntriesTransitionSprite;
        this.currentEntriesTransitionSprite = i;
    }

    animComplete() {
        this.swap();
        currentScene.add.tween({
            targets: this.getTransitionSpites(),
            alpha: 0,
            duration: 2000,
            ease: Phaser.Math.Easing.Quadratic.In,
            delay: 0,
            onComplete: (tween: Phaser.Tweens.Tween) => tween.targets.forEach((spr: IsoSprite) => { spr.alpha = 1; spr.visible = false; })
        });
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
    }

    getTransitionSpites(): IsoSprite[] {
        let sprs: IsoSprite[] = [];
        sprs.push(this.currentRoomTransitionSprite);
        for (let l of LOCATION.enum()) sprs.push(this.currentEntriesTransitionSprite[l]);
        return sprs;
    }
}
export const renderer = new Renderer();