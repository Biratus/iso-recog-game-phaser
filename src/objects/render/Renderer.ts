import { currentScene } from "../../scenes/GameScene";
import { GAME_CONFIG } from "../../constants/Constants";
// import MapManager, { MapRenderer } from "./MapRenderer";
import { LOCATION, INTERACTION_EVENT } from "../../constants/Enums";
import { IsoSprite } from 'phaser3-plugin-isometric';
import Level from "../core/Level";
import Room from "../core/Room";
import { RenderUtils } from "../utils/RenderUtils";
import { LevelUtils } from "../utils/LevelUtils";
import Entry from "../core/Entry";

class IsoGroup {
    prevX: number | undefined = undefined; prevY: number | undefined = undefined;
    children: IsoSprite[] = [];
    tween: Phaser.Tweens.Tween;

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
    static roomTexture = 'CLASSIC_Elongated _w1_Z1o_mediumdarker';
    static playerTexture = 'plyer';
    static entryOffset = 4.5;

    group = new IsoGroup();
    currentRoomSprite: IsoSprite;
    currentEntriesSprite: { [key: string]: IsoSprite };
    currentRoomTransitionSprite: IsoSprite;
    currentEntriesTransitionSprite: { [key: string]: IsoSprite };
    spritesContainer: Phaser.GameObjects.Container;

    player: IsoSprite;
    playerTween: Phaser.Tweens.Tween;

    bg: IsoSprite;
    emitter = new Phaser.Events.EventEmitter();

    bgParticles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

    debug = false;

    constructor() {
        this.bg = currentScene.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background8');
        this.bg.scaleX = window.innerWidth / this.bg.width;
        this.bg.scaleY = window.innerHeight / this.bg.height;
        this.bg.depth = -999;
        this.spritesContainer = currentScene.add.container(0, 0);
        this.spritesContainer.depth = 999;

        // let assets = ['p_white', 'p_yellow'];
        // let sizeFactor = 0.85;
        // let offsetY = 0;
        // let rectSource = new Phaser.Geom.Rectangle(window.innerWidth*(1-sizeFactor), window.innerHeight*(1-sizeFactor-offsetY), window.innerWidth*sizeFactor, window.innerHeight*(sizeFactor-offsetY));
        // for (let a of assets) {
        //     let e = currentScene.add.particles(a).createEmitter({
        //         x: 0,
        //         y: 0,
        //         frequency: 400,
        //         angle: { max: 360, min: 0 },
        //         speed: { min: 30, max: 70 },
        //         scale: { min: 0.05, max: 0.1 },
        //         alpha: { start: 1, end: 0, ease: 'Linear' },
        //         blendMode: 'SCREEN'
        //     });
        //     e.scaleX.onUpdate = e.scaleX.defaultUpdate;
        //     this.bgParticles.push(e);
        // }

        let e = currentScene.add.particles('p_bg').createEmitter({
            frame: { frames: ['white','yellow'], cycle: true, quantity: 2 },
            x: 0,
            y: 0,
            frequency: 400,
            lifespan:2000,
            angle: { max: 360, min: 0 },
            speed: { min: 20, max: 50 },
            scale: { min: 0.05, max: 0.1 },
            alpha: { start: 1, end: 0 },
            blendMode: 'SCREEN'
        });
        e.scaleX.onUpdate = e.scaleX.defaultUpdate;
        this.bgParticles.push(e);

    }

    renderRoom = (room: Room) => {
        this.initSprites();
        //render current room sprite with room texture
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

    private initSprites = () => {
        if (!this.currentRoomSprite) {
            this.currentRoomSprite = currentScene.add.isoSprite(0, 0, 0, Renderer.roomTexture);
            this.currentRoomSprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
            this.currentRoomSprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
            this.currentRoomSprite.isoZ -= RenderUtils.spriteIsoHeight(this.currentRoomSprite) / 2;
            this.currentRoomSprite.texture.source.forEach(src => src.resolution = 10);
        }
        if (!this.currentEntriesSprite) {
            this.currentEntriesSprite = {};
            for (let loc of LOCATION.enum()) {
                let tile_width = RenderUtils.spriteIsoWidth(this.currentRoomSprite);
                let canvasLoc = LOCATION.multiply(LOCATION[loc], tile_width / 2);
                let sprite = currentScene.add.isoSprite(canvasLoc.x, canvasLoc.y, 0, Renderer.entryTextures[loc].texture);
                sprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
                sprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
                sprite.texture.source.forEach(src => src.resolution = 10);
                tile_width = RenderUtils.spriteIsoWidth(sprite);
                sprite.isoX += (tile_width / 2) * LOCATION[loc].x - LOCATION[loc].x * 100;
                sprite.isoY += (tile_width / 2) * LOCATION[loc].y - LOCATION[loc].y * 100;
                sprite.isoZ -= RenderUtils.spriteIsoHeight(sprite) / 2;
                sprite.setInteractive(currentScene.input.makePixelPerfect(100));
                sprite.on('pointerdown', () => this.emitter.emit(INTERACTION_EVENT.ENTRY_CLICK, loc));
                this.currentEntriesSprite[loc] = sprite;
            }
        }
        if (!this.currentRoomTransitionSprite) {
            this.currentRoomTransitionSprite = currentScene.add.isoSprite(0, 0, 0, Renderer.roomTexture);
            this.currentRoomTransitionSprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
            this.currentRoomTransitionSprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
            this.currentRoomTransitionSprite.isoZ -= RenderUtils.spriteIsoHeight(this.currentRoomSprite) / 2;
            this.currentRoomTransitionSprite.texture.source.forEach(src => src.resolution = 10);
            this.currentRoomTransitionSprite.visible = false;
            // this.currentRoomTransitionSprite.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);
        }
        if (!this.currentEntriesTransitionSprite) {
            this.currentEntriesTransitionSprite = {};
            for (let loc of LOCATION.enum()) {
                let tile_width = RenderUtils.spriteIsoWidth(this.currentRoomSprite);
                let canvasLoc = LOCATION.multiply(LOCATION[loc], tile_width / 2);
                let sprite = currentScene.add.isoSprite(canvasLoc.x, canvasLoc.y, 0, Renderer.entryTextures[loc].texture);
                sprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
                sprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.entryScale;
                sprite.texture.source.forEach(src => src.resolution = 10);
                tile_width = RenderUtils.spriteIsoWidth(sprite);
                sprite.isoX += (tile_width / 2) * LOCATION[loc].x;
                sprite.isoY += (tile_width / 2) * LOCATION[loc].y;
                sprite.isoZ -= RenderUtils.spriteIsoHeight(sprite) / 2;
                sprite.visible = false;
                sprite.setInteractive(currentScene.input.makePixelPerfect(100));
                sprite.on('pointerdown', () => this.emitter.emit(INTERACTION_EVENT.ENTRY_CLICK, loc));
                this.currentEntriesTransitionSprite[loc] = sprite;
            }
        }
        this.group.children = this.getAllSprites();
        this.spritesContainer.add(this.group.children);
        console.log(this.spritesContainer);
        let deathZone = {
            type: 'onEnter',
            source: new Phaser.Geom.Rectangle(0, this.currentEntriesSprite.TOP.y - 3*this.currentEntriesSprite.TOP.height / 4, window.innerWidth, window.innerHeight)
        };
        let validZone = new Phaser.Geom.Rectangle(0, 0, window.innerWidth, this.currentEntriesSprite.TOP.y)
        // let validZone = new Phaser.Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight);
        let emitZone = {
            type: 'random', source: {
                getRandomPoint: (vec) => {
                    let p = validZone.getRandomPoint();
                    vec.x = p.x;
                    vec.y = p.y;
                    return vec;
                }
            }
        }
        this.bgParticles.forEach(e => {
            // e.setDeathZone(deathZone);
            e.setEmitZone(emitZone);
        });
    }

    renderTransition = (source: Room, dest: Room, callback: Function) => {
        //check with source texture
        if (!this.currentRoomSprite || this.currentRoomSprite.key != Renderer.roomTexture) {
            this.renderRoom(source);
        }
        //TODO change all texture according to dest
        // this.currentRoomTransitionSprite.texture=

        let entryExit = LevelUtils.entryBetween(source, dest);

        let loc = this.getRoomLocAt(entryExit);
        if (!loc) {
            console.error("No entry between " + source._id + " and " + dest._id);
            return;
        }
        this.renderRoomTransition(dest, loc);

        this.startTransition(entryExit, callback);
    }

    private getRoomLocAt(entry?: Entry): { x: number, y: number } | undefined {
        if (!entry) return undefined;
        let w = RenderUtils.spriteHalfIsoWidth(this.currentRoomSprite) + RenderUtils.spriteHalfIsoWidth(this.currentRoomTransitionSprite) +
            RenderUtils.spriteIsoWidth(this.currentEntriesTransitionSprite[LOCATION.name(LOCATION.opposite(entry.location))!])
            + RenderUtils.spriteIsoWidth(this.currentEntriesSprite[LOCATION.name(entry.location)!])
        return LOCATION.multiply(entry.location, w);
    }

    private renderRoomTransition(room: Room, loc: { x: number, y: number }) {
        this.getTransitionSprites().forEach(spr => spr.shouldAppear = false);
        this.currentRoomTransitionSprite.isoX = loc.x;
        this.currentRoomTransitionSprite.isoY = loc.y;
        this.currentRoomTransitionSprite.shouldAppear = true;
        for (let entry of room.entries()) {
            let entrySpr = this.currentEntriesTransitionSprite[LOCATION.name(entry.location)!];
            let newLoc = LOCATION.add(loc,
                LOCATION.multiply(entry.location, RenderUtils.spriteHalfIsoWidth(this.currentRoomTransitionSprite) + RenderUtils.spriteHalfIsoWidth(entrySpr)));
            newLoc = LOCATION.add(newLoc, LOCATION.multiply(entry.location, -1 * Renderer.entryOffset * GAME_CONFIG.scale));
            entrySpr.isoX = newLoc.x;
            entrySpr.isoY = newLoc.y;
            entrySpr.shouldAppear = true;
        }
        setTimeout(() => this.getTransitionSprites().filter(spr => spr.shouldAppear).forEach(spr => spr.visible = true), 10);
    }

    private startTransition(entry?: Entry, callback?: Function) {
        if (!entry) return;
        if (this.playerTween) currentScene.tweens.remove(this.playerTween);
        this.playerTween = currentScene.tweens.add({
            targets: this.player,
            isoX: this.currentEntriesSprite[LOCATION.name(entry.location)!].isoX,
            isoY: this.currentEntriesSprite[LOCATION.name(entry.location)!].isoY,
            duration: 1700,
            ease: Phaser.Math.Easing.Linear.Linear,
            delay: 0,
            yoyo: true
        });

        setTimeout(() => {
            let loc = LOCATION.multLoc({ x: -1, y: -1 },
                {
                    x: this.currentRoomTransitionSprite.isoX,
                    y: this.currentRoomTransitionSprite.isoY
                });
            if (this.group.tween) currentScene.tweens.remove(this.group.tween);
            this.group.tween = currentScene.tweens.add({
                targets: this.group,
                x: loc.x,
                y: loc.y,
                duration: 2400,
                ease: Phaser.Math.Easing.Linear.Linear,
                delay: 0,
                onComplete: () => this.endTransition(callback!)
            });

        }, 990);
    }

    private swap() {
        let t = this.currentRoomSprite;
        this.currentRoomSprite = this.currentRoomTransitionSprite;
        this.currentRoomTransitionSprite = t;
        let i = this.currentEntriesSprite;
        this.currentEntriesSprite = this.currentEntriesTransitionSprite;
        this.currentEntriesTransitionSprite = i;
    }

    private endTransition(callback: Function) {
        this.swap();
        callback();
        currentScene.add.tween({
            targets: this.getTransitionSprites(),
            alpha: 0,
            duration: 2000,
            ease: Phaser.Math.Easing.Quadratic.In,
            delay: 0,
            onComplete: () => {
                this.getTransitionSprites().forEach(spr => { spr.alpha = 1; spr.visible = false; });
                this.currentRoomSprite.isoX = 0;
                this.currentRoomSprite.isoY = 0;
            }
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

    getTransitionSprites(): IsoSprite[] {
        let sprs: IsoSprite[] = [];
        sprs.push(this.currentRoomTransitionSprite);
        for (let l of LOCATION.enum()) sprs.push(this.currentEntriesTransitionSprite[l]);
        return sprs;
    }

    renderPlayer() {
        this.player = currentScene.add.isoSprite(0, 0, 0, Renderer.playerTexture);
        this.player.scaleY = GAME_CONFIG.scale * GAME_CONFIG.playerScale;
        this.player.scaleX = GAME_CONFIG.scale * GAME_CONFIG.playerScale;
        this.player.isoZ += RenderUtils.spriteIsoHeight(this.player) / 2;
        this.player.texture.source.forEach(src => src.resolution = 10);
    }

    getEntryTopLocationAt(loc): IsoSprite {
        let e = renderer.currentEntriesSprite[loc];
        return {
            x: e.isoX, y: e.isoY, z: e.isoZ + RenderUtils.spriteHalfIsoHeight(e)
        };
    }

    getEntryTopBackLocationAt(loc): IsoSprite {
        let e = renderer.currentEntriesSprite[loc];
        let locXY = LOCATION.parse(loc);
        let sprIsoW = RenderUtils.spriteHalfIsoWidth(e);
        return {
            x: e.isoX + locXY.x * sprIsoW, y: e.isoY + locXY.y * sprIsoW, z: e.isoZ + RenderUtils.spriteHalfIsoHeight(e)
        };
    }

    static init() { renderer = new Renderer(); }
}
export var renderer: Renderer;