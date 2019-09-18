import { IsoSprite, Point3 } from 'phaser3-plugin-isometric';
import { GAME_CONFIG } from "../../constants/Constants";
// import MapManager, { MapRenderer } from "./MapRenderer";
import { INTERACTION_EVENT, LOCATION, EVENTS } from "../../constants/Enums";
import Entry from "../core/Entry";
import Room from "../core/Room";
import { GameModule } from "../utils/GameUtils";
import { LevelUtils } from "../utils/LevelUtils";
import { RenderUtils } from "../utils/RenderUtils";
import { Timeout } from '../utils/Timeout';
import { Game, FacebookInstantGamesLeaderboard } from 'phaser';
import GameScene from '../../scenes/GameScene';

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

    terrainContainer: Phaser.GameObjects.Container;
    characterContainer: Phaser.GameObjects.Container;
    terrainOverlayContainer: Phaser.GameObjects.Container;
    rendererContainer: Phaser.GameObjects.Container;
    uiContainer: Phaser.GameObjects.Container;

    player: IsoSprite;
    playerTween: Phaser.Tweens.Tween;
    lightSource: Phaser.GameObjects.Sprite;
    lightSourceTween: Phaser.Tweens.Tween;

    bg: IsoSprite;
    emitter = new Phaser.Events.EventEmitter();

    particles: { [key: string]: Phaser.GameObjects.Particles.ParticleEmitter } = {};

    spriteInitialized = false;
    roomTransitionPlaying = false;
    debug = false;

    constructor() {
        GameModule.currentScene.cameras.main.alpha = 0;
        GameModule.currentScene.add.tween({
            targets: GameModule.currentScene.cameras.main,
            alpha: 1,
            duration: 1000,
            ease: Phaser.Math.Easing.Quartic.In
        });
        this.bg = GameModule.currentScene.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background8');
        this.bg.scaleX = window.innerWidth / this.bg.width;
        this.bg.scaleY = window.innerHeight / this.bg.height;
        this.bg.depth = -999;
        this.terrainContainer = GameModule.currentScene.add.container(0, 0);
        this.characterContainer = GameModule.currentScene.add.container(0, 0);
        this.terrainOverlayContainer = GameModule.currentScene.add.container(0, 0);
        this.uiContainer = GameModule.currentScene.add.container(0, 0);
        this.rendererContainer = GameModule.currentScene.add.container(0, 0);
        this.rendererContainer.add(this.bg);
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
        //     this.particles.push(e);
        // }
        let e = GameModule.currentScene.add.particles('p_bg_square2').createEmitter({
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
        e.setEmitZone({
            type: 'random', source: {
                getRandomPoint: (vec) => {
                    let p = new Phaser.Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight).getRandomPoint();
                    vec.x = p.x;
                    vec.y = p.y;
                    return vec;
                }
            }
        });
        this.rendererContainer.add(e.manager);
        this.rendererContainer.add(this.terrainContainer);
        this.rendererContainer.add(this.characterContainer);
        this.rendererContainer.add(this.terrainOverlayContainer);
        // this.rendererContainer.add(this.uiContainer);
        this.particles.bg = e;
    }

    update(time, delta) {
        this.terrainContainer.sort('depth');
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

        this.initSpritesRoom();

        this.group.children = this.getAllSprites();
        this.terrainContainer.add(this.group.children);
        // this.terrainContainer.setDepth(GameModule.topZIndex());
        // //bg particles
        // let validZone = new Phaser.Geom.Rectangle(0, 0, window.innerWidth, this.currentEntriesSprite.TOP.y);
        // let emitZone = {
        //     type: 'random', source: {
        //         getRandomPoint: (vec) => {
        //             let p = validZone.getRandomPoint();
        //             vec.x = p.x;
        //             vec.y = p.y;
        //             return vec;
        //         }
        //     }
        // }
        // this.particles.bg.setEmitZone(emitZone);


        this.spriteInitialized = true;
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
                callback();
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
        this.characterContainer.add(this.player);
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
        this.particles.bg.killAll();
        this.particles.bg.pause();
    }

    resumeBackgroundParticles() {
        this.particles.bg.resume();
    }

    pauseSmokeParticles() {
        for (let location of LOCATION.enum()) {
            //     for (let i = 0; i < 4; i++) {
            //         if (this.particles[EVENTS.ENTRY_SMOKE + location + i]) this.particles[EVENTS.ENTRY_SMOKE + location + i].stop();
            //     }
            if (this.particles[EVENTS.ENTRY_SMOKE + location]) this.particles[EVENTS.ENTRY_SMOKE + location].stop();
        }

    }
    resumeSmokeParticles() {
        for (let location of LOCATION.enum()) {
            // for (let i = 0; i < 4; i++) {
            //     if (this.particles[EVENTS.ENTRY_SMOKE + location + i]) this.particles[EVENTS.ENTRY_SMOKE + location + i].start();
            // }
            if (this.particles[EVENTS.ENTRY_SMOKE + location]) this.particles[EVENTS.ENTRY_SMOKE + location].start();
        }

    }

    playerTakeHit(fromEntry: Entry) {
        if (this.playerTween) {
            this.playerTween.stop();
            GameModule.currentScene.tweens.remove(this.playerTween);
        }
        let knockbackDist = window.innerWidth * 0.025;
        this.player.setTint(0xff002b);
        this.playerTween = GameModule.currentScene.add.tween({
            targets: this.player,
            isoX: { value: knockbackDist * fromEntry.location.x * -1, yoyo: true },
            isoY: { value: knockbackDist * fromEntry.location.y * -1, yoyo: true },
            duration: 30,
            onComplete: () => {
                GameModule.currentScene.tweens.remove(this.playerTween);
                this.player.clearTint();
            }
        });
    }

    tapIndication(x, y, onClick, destroyEvt) {
        let img = GameModule.currentScene.add.sprite(x, y, 'circle_skew').setScale(0.35);
        this.terrainOverlayContainer.add(img);
        let tween = GameModule.currentScene.add.tween({
            targets: img,
            scale: 0.25,
            alpha: 0.5,
            duration: 300,
            yoyo: true,
            loop: -1,
            ease: 'Quadratic.InOut'
        });
        img.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        img.on('pointerup', onClick);
        this.emitter.addListener(destroyEvt, () => { img.destroy(); tween.stop(); });
    }

    sceneTransition(sceneKey, onSceneEnd = () => { }) {
        GameModule.currentScene.add.tween({
            targets: GameModule.currentScene.cameras.main,
            alpha: 0,
            duration: 1000,
            ease: Phaser.Math.Easing.Quartic.Out,
            onComplete: () => {
                onSceneEnd();
                GameModule.currentScene.scene.start(sceneKey);
            }
        });
    }
    textIndx = 0;
    smokeEntry(location: string, destroyEvt = EVENTS.ENTRY_SMOKE + location) {
        let textures = [
            "smoke_06_gray",
            "smoke_08_gray",
            "smoke_07_gray",
            "smoke_01_gray",
            "smoke_02_gray",
            "smoke_03_gray",
            "smoke_04_gray",
            "smoke_05_gray",]
        if (this.textIndx >= textures.length) this.textIndx = 0;
        let smoke = GameModule.currentScene.add.particles(textures[0]);
        this.textIndx++;
        // let line2d = RenderUtils.getTopFrontLine(this.currentEntriesSprite[location], true);
        let center = RenderUtils.topXYFromIsoSprite(this.currentEntriesSprite[location]);
        let w = RenderUtils.spriteHalfIsoWidth(this.currentEntriesSprite[location]) * 0.4;
        let ptsShape = [{ x: center.x + w, y: center.y + w, z: center.z }, { x: center.x + w, y: center.y - w, z: center.z }, { x: center.x - w, y: center.y - w, z: center.z }, { x: center.x - w, y: center.y + w, z: center.z }];

        let emitShape = new Phaser.Geom.Polygon(ptsShape.map(pt => (<GameScene>GameModule.currentScene).iso.projector.project(<Point3>pt)));
        let aabb = Phaser.Geom.Polygon.GetAABB(emitShape);
        let pts = aabb.getPoints(4);
        // for (let i = 0; i < 4; i++) {
        //     let pt = pts[i];
        //     if (this.particles[EVENTS.ENTRY_SMOKE + location + i]) this.particles[EVENTS.ENTRY_SMOKE + location + i].stop();
        //     let rnd = aabb.getRandomPoint();
        //     while (!emitShape.contains(rnd.x, rnd.y)) rnd = aabb.getRandomPoint();
        //     this.particles[EVENTS.ENTRY_SMOKE + location + i] = smoke.createEmitter({
        //         alpha: { start: 1, end: 0 },
        //         scale: { start: 0, end: 0.15 },
        //         speed: 20,
        //         accelerationY: -70,
        //         angle: { min: 20, max: 120 },
        //         // rotate: { min: -180, max: 180 },
        //         lifespan: { min: 900, max: 1000 },
        //         // blendMode: 'SCREEN',
        //         frequency: 300,
        //         x: pt.x,
        //         y: pt.y
        //     });
        // }
        if (this.particles[EVENTS.ENTRY_SMOKE + location]) this.particles[EVENTS.ENTRY_SMOKE + location].stop();
        this.particles[EVENTS.ENTRY_SMOKE + location] = smoke.createEmitter({
            alpha: { start: 1, end: 0 },
            scale: { start: 0, end: 0.2 },
            speed: 20,
            accelerationY: -70,
            angle: { min: -85, max: -95 },
            // rotate: { min: -180, max: 180 },
            lifespan: { min: 900, max: 1000 },
            // blendMode: 'SCREEN',
            frequency: 80,
            x: 0,
            y: 0,
            emitZone: {
                type: 'random', source: {
                    getRandomPoint: (vec) => {
                        let rnd = aabb.getRandomPoint();
                        while (!emitShape.contains(rnd.x, rnd.y)) rnd = aabb.getRandomPoint();
                        vec.x = rnd.x;
                        vec.y = rnd.y;
                        return vec;
                    }
                }
            }
        });
        this.emitter.once(destroyEvt, () => {
            // for (let i = 0; i < 4; i++) {
            //     this.particles[EVENTS.ENTRY_SMOKE + location + i].stop();
            //     delete this.particles[EVENTS.ENTRY_SMOKE + location + i];
            // }
            this.particles[EVENTS.ENTRY_SMOKE + location].stop();
            delete this.particles[EVENTS.ENTRY_SMOKE + location];
        });
        this.particles[EVENTS.ENTRY_SMOKE + location].manager.setDepth(GameModule.topZIndex());
        this.terrainOverlayContainer.add(this.particles[EVENTS.ENTRY_SMOKE + location].manager);
        return textures[this.textIndx - 1];
    }

    shapeClue(path, destroyEvt) {
        if (this.particles.hasOwnProperty(destroyEvt)) this.emitter.emit(destroyEvt);

        let p = GameModule.currentScene.add.particles('blue');
        this.particles[destroyEvt] = p.createEmitter({
            scale: { start: 0.35, end: 0 },
            speed: { min: -10, max: 10 },
            blendMode: 'SCREEN',
            lifespan: 1500,
            frequency: 20,
            emitZone: { type: 'edge', source: path, quantity: 30, yoyo: false }
        });
        this.emitter.once(destroyEvt, () => {
            p.destroy();
            if (this.particles[destroyEvt]) this.particles[destroyEvt].stop();
            delete this.particles[destroyEvt];
        });
        this.uiContainer.add(this.particles[destroyEvt].manager);
    }

    focusLight(sprite, endEvent) {
        this.rendererContainer.clearMask();
        if (this.lightSource) this.lightSource.destroy();
        if (this.lightSourceTween) this.lightSourceTween.stop();

        this.lightSource = GameModule.currentScene.make.sprite({
            x: sprite.x,
            y: sprite.y,
            angle: 90,
            alpha: 0.8,
            key: 'mask1',
            add: false
        });

        this.lightSource.scale = GAME_CONFIG.scale;
        this.lightSourceTween = GameModule.currentScene.tweens.add({
            targets: this.lightSource,
            alpha: 0.5,
            scale: 0.8,
            duration: 1500,
            ease: 'Sine.easeInOut',
            loop: -1,
            yoyo: true
        });
        this.emitter.on(endEvent, () => {
            console.log("lol");
            this.lightSourceTween.stop();
            this.rendererContainer.clearMask();
            this.lightSource.destroy();
            // this.lightSourceTween.stop();
            // this.lightSource.alpha=1;
            // this.lightSourceTween = GameModule.currentScene.tweens.add({
            //     targets: this.lightSource,
            //     scale: 30,
            //     alpha:1,
            //     duration: 1700,
            //     ease: 'Sine.easeInOut',
            //     onComplete: () => {
            //         renderer.terrainContainer.clearMask();
            //         this.lightSource.destroy();
            //     }
            // });
        });
        this.rendererContainer.mask = new Phaser.Display.Masks.BitmapMask(GameModule.currentScene, this.lightSource);
    }

    fadeOutPoints(points, texture, speed, onFinishCallback?) {
        let p = GameModule.currentScene.add.particles(texture);
        let emit = p.createEmitter({
            scale: 0.1,
            speed: { min: -1 * speed, max: speed },
            alpha: { start: 1, end: 0 },
            blendMode: 'SCREEN',
            on: false
        });
        emit.onParticleDeath(() => {
            if (emit.getAliveParticleCount() <= 0) {
                if (onFinishCallback) onFinishCallback();
                p.destroy();
                emit.manager.destroy();
            }
        });
        GameModule.normalizePointName(points).forEach((pt) => p.emitParticleAt(pt.x, pt.y));
        // this.uiContainer.add(emit.manager);
    }


    static init() { renderer = new Renderer(); }
}
export var renderer: Renderer;