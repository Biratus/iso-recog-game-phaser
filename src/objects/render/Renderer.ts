import { IsoSprite, Point3 } from 'phaser3-plugin-isometric';
import { GAME_CONFIG } from "../../constants/Constants";
// import MapManager, { MapRenderer } from "./MapRenderer";
import { EVENTS } from "../../constants/Enums";
import { Location } from '../../constants/Location';
import { GameModule } from '../../utils/GameModule';
import { LevelModule } from '../../utils/LevelModule';
import { RenderUtils } from '../../utils/RenderUtils';
import { Timeout } from '../../utils/Timeout';
import Entry from "../core/Entry";
import Room from "../core/Room";
import { Tweens } from 'phaser';

class IsoGroup {
    prevX: number | undefined = undefined; prevY: number | undefined = undefined;
    children: IsoSprite[] = [];

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
        // console.log('sety ' + val + ' on ' + this.children.length + ' child');
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
    };
    static flipEntry = {
        'TOP': { x: -1, y: -1 },
        'BOTTOM': { x: 1, y: 1 },
        'LEFT': { x: 1, y: -1 },
        'RIGHT': { x: -1, y: 1 },
    };
    static roomTexture = 'roomFull.roomFullB';
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

    bg: IsoSprite;
    emitter = new Phaser.Events.EventEmitter();

    // Particle
    particles: { [key: string]: Phaser.GameObjects.Particles.ParticleEmitter } = {};
    shapeClueEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    shapeClueParticle: Phaser.GameObjects.Particles.ParticleEmitterManager;
    smokeParticle: Phaser.GameObjects.Particles.ParticleEmitterManager;
    smokeEmitters: { [key: string]: Phaser.GameObjects.Particles.ParticleEmitter } = {};

    // Tween
    player: IsoSprite;
    playerTween: Phaser.Tweens.Tween;
    lightSource: Phaser.GameObjects.Sprite;
    lightSourceTween: Phaser.Tweens.Tween;
    tapIndic2d: Phaser.GameObjects.Sprite;
    tapIndic2dTween: Phaser.Tweens.Tween;
    tapIndic3d: Phaser.GameObjects.Sprite;
    tapIndic3dTween: Phaser.Tweens.Tween;

    spriteInitialized = false;
    roomTransitionPlaying = false;
    debug = false;

    constructor() {
        // GameModule.currentScene.game.scale.setGameSize(GameModule.width(),GameModule.height());
        GameModule.currentScene.cameras.main.alpha = 0;
        GameModule.currentScene.add.tween({
            targets: GameModule.currentScene.cameras.main,
            alpha: 1,
            duration: 1000,
            ease: Phaser.Math.Easing.Quartic.In
        });
        this.buildBackground();

        this.rendererContainer.add(this.terrainContainer);
        this.rendererContainer.add(this.characterContainer);
        this.rendererContainer.add(this.terrainOverlayContainer);
        // this.rendererContainer.add(this.uiContainer);
    }

    buildBackground() {
        this.bg = GameModule.currentScene.add.image(GameModule.centerX(), GameModule.centerY(), 'background8');
        this.bg.scaleX = GameModule.width() / this.bg.width;
        this.bg.scaleY = GameModule.height() / this.bg.height;
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
        // let rectSource = new Phaser.Geom.Rectangle(GameModule.width()*(1-sizeFactor), GameModule.height()*(1-sizeFactor-offsetY), GameModule.width()*sizeFactor, GameModule.height()*(sizeFactor-offsetY));
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
                    let p = new Phaser.Geom.Rectangle(0, 0, GameModule.width(), GameModule.height()).getRandomPoint();
                    vec.x = p.x;
                    vec.y = p.y;
                    return vec;
                }
            }
        });
        this.rendererContainer.add(e.manager);
        this.particles.bg = e;
    }

    update(time, delta) {
        //3d axes
        //vertical
        // let pts = [{x:0,y:0,z:0},{x:0,y:0,z:500}].map(pt => GameModule.gameScene().iso.projector.project(<Point3>pt));
        // GameModule.gameScene().animationGraph.debugPoints(pts);

        // let pts = [{ x: 0, y: 0, z: 0 }, { x: 0, y: 500, z: 0 }].map(pt => GameModule.gameScene().iso.projector.project(<Point3>pt));
        // GameModule.gameScene().animationGraph.debugPoints(pts);

        // pts = [{ x: 0, y: 0, z: 0 }, { x: 500, y: 0, z: 0 }].map(pt => GameModule.gameScene().iso.projector.project(<Point3>pt));
        // GameModule.gameScene().animationGraph.debugPoints(pts);

        this.terrainContainer.sort('depth');
    }

    renderRoom = (room: Room) => {

        this.initSprites();
        console.log("Set texture to " + RenderUtils.textureFrom(room));
        this.currentRoomSprite.setTexture(RenderUtils.textureFrom(room));
        this.currentRoomSprite.visible = true;
        this.currentRoomSprite.isoX = 0;
        this.currentRoomSprite.isoY = 0;
    }

    /*
    
    ----- INITIALIZATION ----- 

    */

    private initSprites = () => {
        if (this.spriteInitialized) return;

        this.initSpritesRoom();
        this.initPlayerSprites();
        this.initShapeClueParticles();
        this.initSmokeParticles();

        this.initUISprites();
        this.initEvents();

        this.spriteInitialized = true;
    }

    private initSpritesRoom = () => {
        this.currentRoomSprite = GameModule.currentScene.add.isoSprite(0, 0, 0, Renderer.roomTexture);
        this.currentRoomSprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        this.currentRoomSprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        this.currentRoomSprite.isoZ = -RenderUtils.spriteIsoHeight(this.currentRoomSprite) * 0.5 * GAME_CONFIG.roomScale;
        this.currentRoomSprite.texture.source.forEach(src => src.resolution = 100);

        this.currentRoomTransitionSprite = GameModule.currentScene.add.isoSprite(0, 0, 0, Renderer.roomTexture);
        this.currentRoomTransitionSprite.scaleY = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        this.currentRoomTransitionSprite.scaleX = GAME_CONFIG.scale * GAME_CONFIG.roomScale;
        this.currentRoomTransitionSprite.isoZ = -RenderUtils.spriteIsoHeight(this.currentRoomSprite) * 0.5 * GAME_CONFIG.roomScale;
        this.currentRoomTransitionSprite.texture.source.forEach(src => src.resolution = 100);
        this.currentRoomTransitionSprite.visible = false;

        this.group.children = this.getAllSprites();
        this.terrainContainer.add(this.group.children);
    }

    private initPlayerSprites = () => {
        this.player = GameModule.currentScene.add.isoSprite(0, 0, 0, Renderer.playerTexture);
        this.player.scaleY = GAME_CONFIG.scale * GAME_CONFIG.playerScale;
        this.player.scaleX = GAME_CONFIG.scale * GAME_CONFIG.playerScale;
        this.player.isoX = 0;
        this.player.isoY = 0;
        // this.player.isoZ += RenderUtils.spriteIsoHeight(this.currentRoomSprite) * 0.2;
        // this.player.isoZ += RenderUtils.spriteIsoHeight(this.player) / 2;
        this.player.texture.source.forEach(src => src.resolution = 10);
        this.player.setDepth(GameModule.topZIndex());
        this.characterContainer.add(this.player);
    }

    private initUISprites = () => {
        this.tapIndic2d = GameModule.currentScene.add.sprite(0, 0, 'tapindic').setScale(0.5);
        this.tapIndic2dTween = GameModule.currentScene.add.tween({
            targets: this.tapIndic2d,
            scale: { from: 0.2, to: 0.6 },
            alpha: { from: 1, to: 0 },
            duration: 400,
            ease: 'Quadratic.InOut'
        });
        this.uiContainer.add(this.tapIndic2d);

        this.tapIndic3d = GameModule.currentScene.add.sprite(0, 0, 'circle_skew').setScale(0.35).setVisible(false);
        this.tapIndic3d.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        this.terrainOverlayContainer.add(this.tapIndic3d);
        this.tapIndic3dTween = GameModule.currentScene.add.tween({
            targets: this.tapIndic3d,
            scale: 0.25,
            alpha: 0.5,
            duration: 300,
            yoyo: true,
            loop: -1,
            ease: 'Quadratic.InOut'
        });
    }

    private initSmokeParticles = () => {
        this.smokeParticle = GameModule.currentScene.add.particles('smoke_06_gray');
        this.terrainOverlayContainer.add(this.smokeParticle);
        for (let loc of Location.values()) {
            let event = EVENTS.ENTRY_SMOKE + loc;
            let emitShape = <Phaser.Geom.Polygon>RenderUtils.getEntryPolygon(this.currentRoomSprite, loc, false);
            let aabb = Phaser.Geom.Polygon.GetAABB(emitShape);
            this.smokeEmitters[loc] = this.smokeParticle.createEmitter({
                alpha: { start: 1, end: 0.2 },
                scale: { start: 0, end: 0.1 },
                // speed: 2,
                // gravityY: -5,
                angle: { min: -85, max: -95 },
                rotate: { min: -180, max: 180 },
                lifespan: 1000,
                // lifespan: { min: 500, max: 700 },
                // blendMode: 'SCREEN',
                frequency: 300,
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
            this.emitter.on(event, () => {
                this.smokeEmitters[loc].stop();
            });
            this.smokeEmitters[loc].stop();
            //debug
            // let pts = aabb.getPoints(4);
            // GameModule.gameScene().animationGraph.drawPolygon(emitShape);
            // GameModule.gameScene().animationGraph.debugPoint(GameModule.gameScene().iso.projector.project(<Point3>center));
            // GameModule.gameScene().animationGraph.debugPoints(pts);

        }
    }

    private initShapeClueParticles = () => {
        this.shapeClueParticle = GameModule.currentScene.add.particles('blue');
        this.shapeClueEmitter = this.shapeClueParticle.createEmitter({
            scale: { start: 0.35, end: 0 },
            speed: { min: -10, max: 10 },
            blendMode: 'SCREEN',
            lifespan: 1500,
            frequency: 20
        });
        this.shapeClueEmitter.stop();
        this.uiContainer.add(this.shapeClueParticle);
    }

    private initEvents = () => {
        for (let loc of Location.values()) {
            let emitShape = <Phaser.Geom.Polygon>RenderUtils.getEntryPolygon(this.currentRoomSprite, loc, false);
            GameModule.currentScene.input.on('pointerdown', (evt) => {
                if (emitShape.contains(evt.x, evt.y)) {
                    console.log("CLICK ON " + loc);
                    this.emitter.emit(EVENTS.ENTRY_CLICK, loc);
                }
            });
        }
    }

    /*
    
    ----- TRANSITION ----- 

    */
    renderTransition = (source: Room, dest: Room, callback: Function) => {
        if (this.roomTransitionPlaying) return;
        this.roomTransitionPlaying = true;

        this.currentRoomTransitionSprite.setTexture(RenderUtils.textureFrom(dest));

        let entryExit = LevelModule.entryBetween(source, dest);
        console.log("GOING THROUGH " + Location.name(entryExit!.location), entryExit);

        let loc = this.getRoomLocAt(entryExit);
        if (!loc) {
            console.error("No entry between " + source._id + " and " + dest._id);
            return;
        }
        this.renderRoomTransition(loc);

        this.startTransition(entryExit, callback);
    }

    private renderRoomTransition(loc: { x: number, y: number }) {
        this.currentRoomTransitionSprite.isoX = loc.x;
        this.currentRoomTransitionSprite.isoY = loc.y;
        Timeout.in(10).do(() => this.currentRoomTransitionSprite.visible = true).start();
    }

    private startTransition(entry?: Entry, callback?: Function) {
        if (!entry) return;
        let entryLoc = this.getEntryTopLoc(Location.name(entry.location));
        this.playerTween = GameModule.currentScene.tweens.add({
            targets: this.player,
            duration: 1700,
            ease: Phaser.Math.Easing.Linear.Linear,
            delay: 0,
            yoyo: true,
            isoX:  entryLoc.x,
            isoY: entryLoc.y
        });
        this.playerTween.restart();
        Timeout.in(990).do(() => {
            let loc = Location.multLoc({ x: -1, y: -1 }, {
                x: this.currentRoomTransitionSprite.isoX,
                y: this.currentRoomTransitionSprite.isoY
            });
            GameModule.currentScene.tweens.add({
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
        return sprs;
    }

    getTransitionSprites(): IsoSprite[] {
        let sprs: IsoSprite[] = [];
        sprs.push(this.currentRoomTransitionSprite);
        return sprs;
    }
    /*
    
    ----- LOCATION COORDS ----- 

    */
    getEntryTopBackLocationAt(loc, inIso = true): { x: number, y: number, z: number } {
        let locNum = <{ x: number, y: number }>Location.parse(loc);
        let opp = (<string>Location.name(<{ x: number, y: number }>Location.opposite(locNum))).toLowerCase();
        let top = RenderUtils.getEntryPolygon(this.currentRoomSprite, loc, inIso)[opp];
        if (locNum.x == 0) top = { x: 0, y: top, z: 0 };
        else if (locNum.y == 0) top = { x: top, y: 0, z: 0 };
        return top;
    }

    getEntryTopLoc(loc): { x: number, y: number, z: number } {
        let pos = RenderUtils.getEntryCenterFromRoom(renderer.currentRoomSprite, loc);
        pos.z = 0;
        return pos;
    }

    getRoomLocAt(entry?: Entry): { x: number, y: number } | undefined {
        if (!entry) return undefined;
        let locStr = Location.name(entry.location);
        let w = GAME_CONFIG.scale * GAME_CONFIG.roomScale * this.currentRoomSprite.width * 0.2;
        let entryBack = this.getEntryTopBackLocationAt(locStr);
        entryBack = Location.add(Location.multiply(entry.location, w), entryBack);
        entryBack = Location.add(Location.multiply(entry.location, RenderUtils.spriteHalfIsoWidth(this.currentRoomSprite)), entryBack);
        // debug
        // let pt = GameModule.gameScene().iso.projector.project(<Point3>entryBack);
        // GameModule.gameScene().animationGraph.debugPoint(pt);
        return entryBack;
    }

    pauseBackgroundParticles() {
        this.particles.bg.killAll();
        this.particles.bg.pause();
    }

    resumeBackgroundParticles() {
        this.particles.bg.resume();
    }

    pauseSmokeParticles() {
        for (let location of Location.values()) {
            if (this.particles[EVENTS.ENTRY_SMOKE + location]) this.particles[EVENTS.ENTRY_SMOKE + location].stop();
        }

    }
    resumeSmokeParticles() {
        for (let location of Location.values()) {
            if (this.particles[EVENTS.ENTRY_SMOKE + location]) this.particles[EVENTS.ENTRY_SMOKE + location].start();
        }

    }

    playerTakeHit(fromEntry: Entry) {
        if (this.playerTween) {
            this.playerTween.stop();
            GameModule.currentScene.tweens.remove(this.playerTween);
        }
        let knockbackDist = GameModule.width() * 0.025;
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
        this.tapIndic3d.x = x;
        this.tapIndic3d.y = y;
        this.tapIndic3d.visible = true;
        this.tapIndic3dTween.restart();

        this.tapIndic3d.on('pointerup', onClick);
        this.emitter.addListener(destroyEvt, () => {
            this.tapIndic3d.visible = false;
            this.tapIndic3dTween.stop();
        });
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
    smokeEntry(location: string) {
        this.smokeEmitters[location].start();

        //debug
        // let emitShape = <Phaser.Geom.Polygon>RenderUtils.getEntryPolygon(this.currentRoomSprite, location, false);
        // let aabb = Phaser.Geom.Polygon.GetAABB(emitShape);
        // let pts = aabb.getPoints(4);
        // GameModule.gameScene().animationGraph.drawPolygon(aabb);
        // GameModule.gameScene().animationGraph.debugPoint(GameModule.gameScene().iso.projector.project(<Point3>center));
        // GameModule.gameScene().animationGraph.debugPoints(pts);
    }

    shapeClue(path: Phaser.Curves.Path, destroyEvt) {
        if (this.particles.hasOwnProperty(destroyEvt)) this.emitter.emit(destroyEvt);

        // duration of the drawing
        let drawSpeed = 3000;
        // time to wait before drawing again
        let delayTime = 1000;
        let startTime = new Date().getTime();

        this.tapIndic2d.x = path.startPoint.x;
        this.tapIndic2d.y = path.startPoint.y;
        this.tapIndic2dTween.restart();

        // let emitZone = { type: 'edge', source: path, quantity: 30 };
        this.shapeClueEmitter.setPosition(
            () => {
                let position = (new Date().getTime() - startTime) / drawSpeed;
                return path.getPoint(position > 1 ? 1 : position).x
            },
            () => {
                let position = (new Date().getTime() - startTime) / drawSpeed;
                return path.getPoint(position > 1 ? 1 : position).y
            });
        this.shapeClueEmitter.start();
        let deleteAll;
        let delayTimeout = Timeout.in(delayTime).do(() => {
            this.shapeClue(path, destroyEvt);
        });
        let timeout = Timeout.in(drawSpeed).do(() => {
            deleteAll();
            delayTimeout.start();
        }).start();
        deleteAll = () => {
            // p.destroy();
            // img.destroy();
            // tween.stop();
            timeout.destroy();
            delayTimeout.destroy();
            // if (this.particles[destroyEvt]) this.particles[destroyEvt].remove();
            // delete this.particles[destroyEvt];
            this.shapeClueEmitter.stop();
        }
        this.emitter.once(destroyEvt, deleteAll);
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
            this.lightSourceTween.stop();
            this.rendererContainer.clearMask();
            this.lightSource.destroy();
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