import IsoPlugin, { IsoPhysics, Point3 } from 'phaser3-plugin-isometric';
import { CLASSIC } from 'phaser3-plugin-isometric/src/Projector';
import { SCENE_GAME, SCENE_TUTORIAL, GAME_CONFIG } from "../constants/Constants";
import { EVENTS } from '../constants/Enums';
import Enemy from "../objects/character/Enemy";
import Level from "../objects/core/Level";
import RecogListener from "../objects/recognizer/RecogListener";
import AnimationGraph from "../objects/render/AnimationGraph";
import Renderer, { renderer } from "../objects/render/Renderer";
import { Location } from '../constants/Location';
import { Timeout } from '../utils/Timeout';
import { GameModule } from '../utils/GameModule';
import Loader from '../utils/Loader';
import { RenderUtils } from '../utils/RenderUtils';

export default class TutorialScene extends Phaser.Scene {

    awaitingDrawing = false;
    _screenSize: number;
    currentLevel: Level;
    recogListener: RecogListener;
    animationGraph: AnimationGraph;
    info: Phaser.GameObjects.Text;
    info2: Phaser.GameObjects.Text;
    currentShapeTxt: Phaser.GameObjects.Text;

    userShapes: any[] = [];

    isPause = false;
    over = false;

    currentShape: { shape: string, path: any };

    projectionText: string = "NONE";
    enemyQueue: Enemy[] = [];
    shapeDrawTimeout: Timeout;
    // steps = [
    //     {
    //         currentEvt:0,
    //         eventChain:[() => {'Let us show you the way of the ancient ones...',''],
    //         next: () => {
    //             this.eventChain[this.currentEvt]();
    //         }
    //     }
    // ];
    currentStep = 0;

    constructor() {
        super(SCENE_TUTORIAL);
    }
    preload = () => {
        GameModule.currentScene = this;
        // PLUGIN
        this.load.scenePlugin({
            key: 'IsoPlugin',
            url: IsoPlugin,
            sceneKey: 'iso'
        });
        this.load.scenePlugin({
            key: 'IsoPhysics',
            url: IsoPhysics,
            sceneKey: 'isoPhysics'
        });
        localStorage.removeItem('userShapes');
        this._screenSize = Phaser.Math.Distance.Between(0, 0, GameModule.width(), GameModule.height());
        // this.game.scale.displaySize.aspectRatio = GameModule.width() / GameModule.height();
        this.recogListener = new RecogListener(this.events);
        this.animationGraph = new AnimationGraph(this.add.graphics({
            x: 0, y: 0,
            lineStyle: { color: 0xffffff, width: 10 },
            fillStyle: { color: 0xffffff, alpha: 1 }
        }));
        Renderer.init();
        // renderer.initBasic();
    }

    create() {
        // renderer.initComplete();
        this.children.sortChildrenFlag = true;
        // ISO PLUGIN
        // this.isoPhysics.world.gravity.setTo(0, 0, -500);
        let rx = 0.5 * GameModule.width() / this.sys.game.canvas.width;
        let ry = 0.5 * GameModule.height() / this.sys.game.canvas.height;
        this.iso.projector.origin.setTo(rx, ry);
        this.iso.projector.projectionAngle = CLASSIC;

        // GRAPHICS
        // this.currentShapeTxt = this.add.text(GameModule.width() * 0.35, GameModule.height() * 0.2, '', { font: '30px Arial', fill: '#ff0000' });
        // this.info = this.add.text(50, 50, this.projectionText, { color: 'red', size: '50px' });

        // let startBtn = this.add.image(50, 100, 'button_green');
        // startBtn.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        // startBtn.once('pointerup', () => {
        //     this.start();
        //     startBtn.once('pointerup', () => {
        //         this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.pause());
        //         this.goToNextScene();
        //     });
        // }
        // );

        this.currentLevel = Loader.loadLevel(GameModule.currentScene.cache.json.get('tutorial').Level);
        this.currentLevel.preload();
        this.currentLevel.create();
        renderer.renderRoom(this.currentLevel.currentRoom);

        this.initEvents();

        // let startBtn = this.add.image(50, 100, 'button_green');
        // startBtn.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        // startBtn.once('pointerup', () => {
        //     this.goToNextScene();
        // });

        this.start();
        console.log(this);

        //DEBUG
        // let debugBtn = this.add.image(GameModule.width() * 0.7, 0, 'button_red');
        // debugBtn.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        // debugBtn.on('pointerdown', () => {
        //     console.log('GameModule.currentScene', this);
        // });
    }
    start() {
        this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => {
            if (!enMana.isOver()) renderer.smokeEntry(Location.name(enMana.entry.location)!);
            enMana.start();
        });
    }

    userInputShape(shape) {
        let totW = GameModule.width();
        let totH = GameModule.height();
        let size = 0.4 * totW;
        let holeSize = size * 0.6;
        let x, y, path;
        switch (shape.toUpperCase()) {
            case 'SQUARE':
                x = (totW - size) / 2;
                y = (totH - size) / 2;
                let w = (size + holeSize) / 2;
                // path = new Phaser.Geom.Rectangle(x, y, w, w);
                path = new Phaser.Curves.Path(x, y).lineTo(x, y + w).lineTo(x + w, y + w).lineTo(x + w, y).closePath();
                break;
            case 'CIRCLE':
                x = GameModule.width() * 0.15 + totW / 2; y = totH / 2;
                // path = new Phaser.Geom.Circle(x, y, GameModule.width() * 0.3);
                path = new Phaser.Curves.Path(x, y).circleTo(GameModule.width() * 0.15, true);
                break;
            default: console.log("CANNOT FIND CORRESPONDING SHAPE : " + shape);
        }
        renderer.shapeClue(path, 'userInput');
        this.currentShape = { shape, path };

    }

    pause() {
        this.isPause = true;
        this.recogListener.disable();
        this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.pause());
    }

    resume() {
        this.isPause = false;
        this.recogListener.enable();
        this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => {
            if (!enMana.isOver()) renderer.smokeEntry(Location.name(enMana.entry.location)!);
            enMana.start();
        });

    }

    update(time: number, delta: number) {
        this.currentLevel.update(time, delta);
        this.animationGraph.update(time, delta);
        this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => {
            if (enMana.isOver()) renderer.emitter.emit(EVENTS.ENTRY_SMOKE + Location.name(enMana.entry.location));
        });
        renderer.update(time, delta);
    }

    initEvents() {

        this.events.on(EVENTS.ENEMY_SPAWN, (en: Enemy) => {
            this.currentLevel.currentRoom.getAllEnemiesManager().filter((enMana) => !enMana.alive.has(en.id)).forEach((enMana) => enMana.pause());
            this.shapeDrawTimeout = Timeout.in(1500).do(() => {
                renderer.pauseBackgroundParticles();
                // renderer.pauseSmokeParticles();
                this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.pause());
                this.awaitingDrawing = true;
                this.recogListener.enable();
                renderer.focusLight(en.sprite, EVENTS.LIGHT);
                this.userInputShape(en.sign);
            }).start();
        });
        this.events.addListener(EVENTS.SHAPE_DRAWN, ({ result, list }) => {
            result = result || { Name: undefined, Score: 0 };
            list = list || [];

            let threshold = GameModule.debug ? 0.8 : GAME_CONFIG.recog_threshold;
            if (result.Name && result.Name.toUpperCase() === this.currentShape.shape.toUpperCase() && result.Score > threshold) {
                renderer.resumeBackgroundParticles();
                renderer.fadeOutPoints(this.recogListener.points, 'blue', 30);
                renderer.emitter.emit(EVENTS.LIGHT);
                this.currentLevel.currentRoom.killEnemies(this.currentShape.shape);
                this.awaitingDrawing = false;
                this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.resume());
                this.recogListener.disable();
                this.userShapes.push({ name: this.currentShape.shape, points: this.recogListener.points });
            } else {
                renderer.fadeOutPoints(this.recogListener.points, 'red', 10, () => {
                    if (!this.input.activePointer.isDown)
                        renderer.shapeClue(this.currentShape.path, 'userInput');
                });
            }
            if (this.currentLevel.currentRoom.getAllEnemiesManager().every((enMana) => enMana.isOver())) {
                localStorage.setItem('tutorialOver', 'true');
                for (let shape of this.userShapes) this.recogListener.addUserShape(shape.name, shape.points);
                let pos2d = GameModule.gameScene().iso.projector.project(<Point3>renderer.getEntryTopLoc('BOTTOM'));
                renderer.tapIndication(pos2d.x, pos2d.y, () => {
                    renderer.emitter.emit(EVENTS.TAP_INDICATION);
                    
                }, EVENTS.TAP_INDICATION);
                this.over = true;
            }
        });
        this.input.on('pointerdown', (pointer) => {
            this.recogListener.emitter.emit('pointerdown', pointer);
            renderer.emitter.emit('userInput');
        });
        this.input.on('pointermove', (pointer) => {
            this.recogListener.emitter.emit('pointermove', pointer);
        });
        this.input.on('pointerup', (pointer) => {
            this.recogListener.emitter.emit('pointerup', pointer);
        });
        renderer.emitter.addListener(EVENTS.ENTRY_CLICK, (location: string) => {
            if (!this.over) return;
            renderer.emitter.emit(EVENTS.TAP_INDICATION);
            let renderEntry = renderer.getEntryTopLoc(location);
            GameModule.currentScene.tweens.add({
                targets: renderer.player,
                isoX: renderEntry.x,
                isoY: renderEntry.y,
                duration: 1700,
                delay: 0,
                onComplete: () => this.goToNextScene()
            });
        });
    }

    goToNextScene() {
        renderer.sceneTransition(SCENE_GAME.key);
    }
}