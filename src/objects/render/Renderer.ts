import { IsoSprite } from 'phaser3-plugin-isometric';
import { GAME_CONFIG } from "../../constants/Constants";
// import MapManager, { MapRenderer } from "./MapRenderer";
import { INTERACTION_EVENT, LOCATION } from "../../constants/Enums";
import Entry from "../core/Entry";
import Room from "../core/Room";
import { GameModule } from "../utils/GameUtils";
import { LevelUtils } from "../utils/LevelUtils";
import { RenderUtils } from "../utils/RenderUtils";
import { Timeout } from '../utils/Timeout';

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
    currentRoomSprite: IsoSprite;
    currentEntriesSprite: { [key: string]: IsoSprite };
    currentRoomTransitionSprite: IsoSprite;
    currentEntriesTransitionSprite: { [key: string]: IsoSprite };
    spritesContainer: Phaser.GameObjects.Container;
    roomTransitionPlaying = false;

    player: IsoSprite;
    playerTween: Phaser.Tweens.Tween;

    bg: IsoSprite;
    emitter = new Phaser.Events.EventEmitter();

    bgParticles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

    spriteInitialized = false;
    debug = false;

    constructor() {
        this.bg = GameModule.currentScene.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background8');
        this.bg.scaleX = window.innerWidth / this.bg.width;
        this.bg.scaleY = window.innerHeight / this.bg.height;
        this.bg.depth = -999;
        this.spritesContainer = GameModule.currentScene.add.container(0, 0);
        this.spritesContainer.add(this.bg);

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
        let e = GameModule.currentScene.add.particles('p_bg_square').createEmitter({
            frame: { frames: ['stroke', 'fill'], cycle: true, quantity: 2 },
            x: 0,
            y: 0,
            frequency: 500,
            lifespan: 2000,
            angle: { max: 360, min: 0, steps: 10 },
            speed: { min: 20, max: 30, steps: 1 },
            scale: { min: 0.05, max: 0.1 },
            rotate: { min: 0, max: 360, steps: 10 },
            alpha: { onEmit: (p) => p.alpha = 0, onUpdate: (p, key, t, value) => p.alpha = t < 0.5 ? t : 1 - t },
            blendMode: 'SCREEN'
        });
        e.texture.source.forEach(src => src.resolution = 10);
        e.scaleX.onUpdate = e.scaleX.defaultUpdate;
        this.bgParticles.push(e);
    }

    update(time, delta) {
        this.spritesContainer.sort('depth');
    }

    renderRoom = (room: Room) => {
        this.initSprites();
        //render current room sprite with room texture
        this.currentRoomSprite.visible = true;
        this.currentRoomSprite.isoX = 0;
        this.currentRoomSprite.isoY = 0;
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
        if (this.spriteInitialized) return;
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
            sprite.on('pointerdown', () => this.emitter.emit(INTERACTION_EVENT.ENTRY_CLICK, loc));
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
            sprite.on('pointerdown', () => this.emitter.emit(INTERACTION_EVENT.ENTRY_CLICK, loc));
            this.currentEntriesTransitionSprite[loc] = sprite;
        }
        this.group.children = this.getAllSprites();
        this.spritesContainer.add(this.group.children);
        let validZone = new Phaser.Geom.Rectangle(0, 0, window.innerWidth, this.currentEntriesSprite.TOP.y);
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
        this.bgParticles.forEach(e => e.setEmitZone(emitZone));
        this.spriteInitialized = true;
    }

    renderTransition = (source: Room, dest: Room, callback: Function) => {
        if (this.roomTransitionPlaying) return;
        this.roomTransitionPlaying = true;

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
        Timeout.in(10).do(() => this.getTransitionSprites().filter(spr => spr.shouldAppear).forEach(spr => spr.visible = true)).start();
    }

    private startTransition(entry?: Entry, callback?: Function) {
        if (!entry) return;
        if (this.playerTween) GameModule.currentScene.tweens.remove(this.playerTween);
        this.playerTween = GameModule.currentScene.tweens.add({
            targets: this.player,
            isoX: this.currentEntriesSprite[LOCATION.name(entry.location)!].isoX,
            isoY: this.currentEntriesSprite[LOCATION.name(entry.location)!].isoY,
            duration: 1700,
            ease: Phaser.Math.Easing.Linear.Linear,
            delay: 0,
            yoyo: true
        });
        Timeout.in(990).do(() => {
            let loc = LOCATION.multLoc({ x: -1, y: -1 },
                {
                    x: this.currentRoomTransitionSprite.isoX,
                    y: this.currentRoomTransitionSprite.isoY
                });
            if (this.group.tween) GameModule.currentScene.tweens.remove(this.group.tween);
            this.group.tween = GameModule.currentScene.tweens.add({
                targets: this.group,
                x: loc.x,
                y: loc.y,
                duration: 2400,
                ease: Phaser.Math.Easing.Linear.Linear,
                delay: 0,
                onComplete: () => this.endTransition(callback!)
            });

        }).start();
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
        GameModule.currentScene.add.tween({
            targets: this.getTransitionSprites(),
            alpha: 0,
            duration: 2000,
            ease: Phaser.Math.Easing.Quadratic.In,
            delay: 0,
            onComplete: () => {
                this.getTransitionSprites().forEach(spr => { spr.alpha = 1; spr.visible = false; });
                this.currentRoomSprite.isoX = 0;
                this.currentRoomSprite.isoY = 0;
                this.roomTransitionPlaying = false;
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
        this.player = GameModule.currentScene.add.isoSprite(0, 0, 0, Renderer.playerTexture);
        this.player.scaleY = GAME_CONFIG.scale * GAME_CONFIG.playerScale;
        this.player.scaleX = GAME_CONFIG.scale * GAME_CONFIG.playerScale;
        this.player.isoZ += RenderUtils.spriteIsoHeight(this.player) / 2;
        this.player.texture.source.forEach(src => src.resolution = 10);
        this.player.setDepth(GameModule.topZIndex());
        this.spritesContainer.add(this.player);
    }

    getEntryTopLocationAt(loc): IsoSprite {
        let e = renderer.currentEntriesSprite[loc];
        return {
            x: e.isoX, y: e.isoY, z: e.isoZ + RenderUtils.spriteHalfIsoHeight(e)
        };
    }

    getEntryTopBackLocationAt(loc): { x: number, y: number, z: number } {
        let e = renderer.currentEntriesSprite[loc];
        let locXY = LOCATION.parse(loc);
        let sprIsoW = RenderUtils.spriteHalfIsoWidth(e);
        return {
            x: e.isoX + locXY.x * sprIsoW, y: e.isoY + locXY.y * sprIsoW, z: e.isoZ + RenderUtils.spriteHalfIsoHeight(e)
        };
    }

    pauseBackgroundParticles() {
        this.bgParticles.forEach(p => p.killAll());
        this.bgParticles.forEach(p => p.pause());
    }

    resumeBackgroundParticles() {
        this.bgParticles.forEach(p => p.resume());
    }

    static init() { renderer = new Renderer(); }
}
export var renderer: Renderer;