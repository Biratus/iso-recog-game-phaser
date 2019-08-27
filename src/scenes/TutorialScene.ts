import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric';
import { CLASSIC } from 'phaser3-plugin-isometric/src/Projector';
import { SCENE_GAME, SCENE_TUTORIAL } from "../constants/Constants";
import Enemy from "../objects/character/Enemy";
import Level from "../objects/core/Level";
import RecogListener from "../objects/recognizer/RecogListener";
import AnimationGraph from "../objects/render/AnimationGraph";
import Renderer, { renderer } from "../objects/render/Renderer";
import ArrayUtils from "../objects/utils/ArrayUtils";
import { GameModule } from "../objects/utils/GameUtils";
import Loader from "../objects/utils/Loader";
import { Timeout } from "../objects/utils/Timeout";

export default class TutorialScene extends Phaser.Scene {

    awaitingDrawing = false;
    _screenSize: number;
    currentLevel: Level;
    recogListener: RecogListener;
    animationGraph: AnimationGraph;
    info: Phaser.GameObjects.Text;
    info2: Phaser.GameObjects.Text;
    currentShapeTxt: Phaser.GameObjects.Text;

    isPause = false;

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
        this._screenSize = Phaser.Math.Distance.Between(0, 0, window.innerWidth, window.innerHeight);
        this.recogListener = new RecogListener(this.events);
        this.animationGraph = new AnimationGraph(this.add.graphics({
            x: 0, y: 0,
            lineStyle: { color: 0xffffff, width: 10 },
            fillStyle: { color: 0xffffff, alpha: 1 }
        }));
        Renderer.init();
    }

    create() {
        this.children.sortChildrenFlag = true;
        // ISO PLUGIN
        // this.isoPhysics.world.gravity.setTo(0, 0, -500);
        let rx = 0.5 * window.innerWidth / this.sys.game.canvas.width;
        let ry = 0.75 * window.innerHeight / this.sys.game.canvas.height;
        this.iso.projector.origin.setTo(rx, ry);
        this.iso.projector.projectionAngle = CLASSIC;

        // GRAPHICS
        this.currentShapeTxt = this.add.text(window.innerWidth * 0.35, window.innerHeight * 0.2, '', { font: '30px Arial', fill: '#ff0000' });
        this.info = this.add.text(50, 50, this.projectionText, { color: 'red', size: '50px' });

        let startBtn = this.add.image(50, 100, 'button_green');
        startBtn.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        startBtn.once('pointerup', () => {
            this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.start());
            startBtn.once('pointerup', () => {
                this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.pause());
                this.goToNextScene();
            });
        }
        );

        this.currentLevel = Loader.loadLevel(GameModule.currentScene.cache.json.get('tutorial').Level);
        this.currentLevel.preload();
        this.currentLevel.create();
        renderer.renderRoom(this.currentLevel.currentRoom);
        renderer.renderPlayer();

        this.initEvents();

        // let startBtn = this.add.image(50, 100, 'button_green');
        // startBtn.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        // startBtn.once('pointerup', () => {
        //     this.goToNextScene();
        // });

        this.start();

        //DEBUG
        let debugBtn = this.add.image(window.innerWidth * 0.7, 0, 'button_red');
        debugBtn.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
        debugBtn.on('pointerdown', () => console.log('GameModule.currentScene', this));
    }

    start() {
        this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.start());
    }

    userInputShape(shape) {
        let totW = window.innerWidth;
        let totH = window.innerHeight;
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
                x = window.innerWidth * 0.15 + totW / 2; y = totH / 2;
                // path = new Phaser.Geom.Circle(x, y, window.innerWidth * 0.3);
                path = new Phaser.Curves.Path(x, y).circleTo(window.innerWidth * 0.15);
                break;
            default: console.log("CANNOT FIND CORRESPONDING SHAPE : " + shape);
        }
        this.animationGraph.shapeClue(path, 'userInput');
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
        this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.start());

    }

    update(time: number, delta: number) {
    }

    initEvents() {

        this.events.on(Enemy.ON_SPAWN, (en: Enemy) => {
            this.currentLevel.currentRoom.getAllEnemiesManager().filter((enMana) => !enMana.alive.has(en.id)).forEach((enMana) => enMana.pause());
            this.shapeDrawTimeout = Timeout.in(750).do(() => {
                renderer.pauseBackgroundParticles();
                this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.pause());
                this.awaitingDrawing = true;
                this.recogListener.enable();
                this.animationGraph.focusLight(en.sprite, 'enLight');
                this.userInputShape(en.sign);
            }).start();
        });
        this.events.addListener('shapeDrown', ({ result, list }) => {
            result = result || { Name: undefined, Score: 0 };
            list = list || [];
            let ordered = {};
            for (let shape of list) {
                if (ordered.hasOwnProperty(shape.Shape)) ordered[shape.Shape].push(shape.Score);
                else if (ArrayUtils.of(ordered).reduce((acc, elt) => ++acc, 0) < 3) {
                    ordered[shape.Shape] = [];
                    ordered[shape.Shape].push(shape.Score);
                } else break;
            }
            let cumul = 0;//cumul difference between 3 highest scores 
            let prev;
            for (let shape in ordered) {
                ordered[shape] = ArrayUtils.of(ordered[shape]).reduce((acc, elt) => acc += elt / ordered[shape].length, 0);
                if (prev) cumul += ordered[shape] - prev;
                prev = ordered[shape];
            }
            let debug = true;
            let threshold = debug ? 0.8 : 0.96;
            if (result.Name && result.Name.toUpperCase() === this.currentShape.shape.toUpperCase() && result.Score > threshold) {
                this.animationGraph.clearMain();
                renderer.resumeBackgroundParticles();
                this.animationGraph.emitter.emit('enLight');
                this.currentLevel.currentRoom.killEnemies(this.currentShape.shape);
                this.awaitingDrawing = false;
                this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.resume());
                this.recogListener.disable();
                // this.animationGraph.fadeOutShape(this.currentShape.shape, this.recogListener.points);
                this.animationGraph.fadeOutPoints(this.recogListener.points, 'blue', 30);
                this.recogListener.addUserShape(this.currentShape.shape);
                // this.animationGraph.emitter.emit('userInput');
            } else {
                this.animationGraph.fadeOutPoints(this.recogListener.points, 'red', 10, () => {
                    if (!this.input.activePointer.isDown)
                        this.animationGraph.shapeClue(this.currentShape.path, 'userInput');
                });
            }
            this.info.setText('Results :' + result.Name + " " + result.Score + "\ncumul: " + cumul);
            if (result.Score < 0.9) {
                this.currentShapeTxt.setText('Not Good Enough!');
            } else this.currentShapeTxt.setText(result.Name);

            if (this.currentLevel.currentRoom.getAllEnemiesManager().every((enMana) => enMana.isOver())) this.goToNextScene();
        });
        this.input.on('pointerdown', (pointer) => {
            this.recogListener.emitter.emit('pointerdown', pointer);
            this.animationGraph.emitter.emit('userInput');
        });
        this.input.on('pointermove', (pointer) => {
            this.recogListener.emitter.emit('pointermove', pointer);
        });
        this.input.on('pointerup', (pointer) => {
            this.recogListener.emitter.emit('pointerup', pointer);
        });

    }

    goToNextScene() {
        this.animationGraph.deleteAll();
        this.scene.start(SCENE_GAME.key);
    }
}