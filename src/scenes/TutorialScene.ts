import Loader from "../objects/utils/Loader";
import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric';
import { CLASSIC } from 'phaser3-plugin-isometric/src/Projector';
import EnemyManager from "../objects/core/EnemyManager";
import Renderer, { renderer } from "../objects/render/Renderer";
import { LOCATION, ENEMY_TYPE } from "../constants/Enums";
import { SCENE_TUTORIAL } from "../constants/Constants";
import Level from "../objects/core/Level";
import RecogListener from "../objects/recognizer/RecogListener";
import AnimationGraph from "../objects/render/AnimationGraph";
import Enemy from "../objects/character/Enemy";
import ArrayUtils from "../objects/utils/ArrayUtils";
import { RenderUtils } from "../objects/utils/RenderUtils";
import { GameModule } from "../objects/utils/GameUtils";

export var currentScene: Phaser.Scene;

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

    currentShape: { shape: string, isInShape: Function, img?: Phaser.GameObjects.Image };

    projectionText: string = "NONE";
    enemyQueue: Enemy[] = [];
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
        currentScene = this;
    }
    preload = () => {
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
        // ISO PLUGIN
        // this.isoPhysics.world.gravity.setTo(0, 0, -500);
        let rx = 0.5 * window.innerWidth / this.sys.game.canvas.width;
        let ry = 0.75 * window.innerHeight / this.sys.game.canvas.height;
        this.iso.projector.origin.setTo(rx, ry);
        this.iso.projector.projectionAngle = CLASSIC;

        // GRAPHICS
        this.currentShapeTxt = this.add.text(window.innerWidth * 0.35, window.innerHeight * 0.2, '', { font: '30px Arial', fill: '#ff0000' });
        this.info = this.add.text(50, 50, this.projectionText, { color: 'red', size: '50px' });

        let startBtn = this.add.image(50, 100, 'button');
        startBtn.setInteractive(currentScene.input.makePixelPerfect(100));
        startBtn.once('pointerup', () => {
            // start level            
            this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.start());
        });

        this.currentLevel = Loader.loadLevel(currentScene.cache.json.get('tutorial').Level);
        this.currentLevel.preload();
        this.currentLevel.create();
        renderer.renderRoom(this.currentLevel.currentRoom);
        renderer.renderPlayer();

        this.initEvents();

        /*let e = this.currentLevel.currentRoom.entries()[0];
        e.enemyManager = new EnemyManager(e);
        let re = renderer.getEntryTopBackLocationAt(LOCATION.name(e.location));
        re.texture = 'en_sm_' + e.sign.toLocaleLowerCase();

        let en = e.enemyManager.createEnemy(re, ENEMY_TYPE.SMALL, {
            name: 'sq1', run: (en, enMana) => {
                en.sprite.isoX = re.x;
                en.sprite.isoY = re.y;
                this.animationGraph.focusLight(en.sprite, 'sq1');
                this.userInputShape(e.sign);
            }
        });

        en.emitter.emit('sq1', e.enemyManager);
        console.log('Entry loc: ' + LOCATION.name(e.location));
        console.log('Enemy', en);*/

        // currentScene.input.on('pointerup', (evt) => {
        //     this.steps[this.currentStep].next();
        // });


    }

    userInputShape(shape) {
        let totW = window.innerWidth;
        let totH = window.innerHeight;
        let size = 0.4 * totW;
        let holeSize = size * 0.6;
        let x, y;
        switch (shape.toUpperCase()) {
            case 'SQUARE':
                let clearSquare = 1.2;
                x = (totW - size) / 2;
                y = (totH - size) / 2;
                // currentScene.animationGraph.clearSquareSpace((totW - size*clearSquare) / 2,(totH - size*clearSquare) / 2,clearSquare,clearSquare);
                this.animationGraph.drawDashedHollowRect({
                    x: x,
                    y: y,
                    w: size, h: size,
                    dashGap: totW * 0.01, dashSize: totW * 0.02,
                    holeW: holeSize, holeH: holeSize,
                    rectColor: 0xffffff, rectAlpha: 0.8,
                    strokeColor: 0xffffff, strokeAlpha: 0.5
                });
                this.currentShape = {
                    shape: shape,
                    isInShape: (points) => points.find((p) => RenderUtils.pointInRect(p, { x, y, w: size, h: size })
                        && !RenderUtils.pointInRect(p, { x: x + (size - holeSize) / 2, y: y + (size - holeSize) / 2, w: holeSize, h: holeSize }))

                }
                break;
            case 'CIRCLE':
                x = totW / 2; y = totH / 2;
                let img = this.add.image(x, y, 'hollowcircle').setScale(0.8);
                let rad = img.width * 0.47;
                let holeRad = img.width * 0.3;
                this.currentShape = {
                    img: img,
                    shape: shape,
                    isInShape: (points) => {
                        points.find((p) => RenderUtils.pointInCircle(p, { x, y, rad }) && !RenderUtils.pointInCircle(p, { x, y, rad: holeRad }))
                    }
                };
                break;
            default: console.log("CANNOT FIND CORRESPONDING SHAPE : " + shape);
        }

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
        this.currentLevel.update(time, delta);

    }

    initEvents() {

        this.events.on(Enemy.ON_SPAWN, (en: Enemy) => {
            console.log('spawn ' + en.sign);
            if (this.awaitingDrawing) {
                this.enemyQueue.push(en);
                return;
            }
            this.recogListener.enable();
            this.animationGraph.focusLight(en.sprite, 'enLight');
            this.userInputShape(en.sign);
            this.awaitingDrawing = true;
            this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.pause());
        });
        this.events.addListener('shapeDrown', ({ result, list }) => {
            // if(!result) {
            //   this.currentShapeTxt.setText("NO RESULTS");
            //   return;
            // }
            list = list  ||[];
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

            if (this.currentShape.isInShape(GameModule.normalizePointName(this.recogListener.points))) {
                console.log('in');
                this.animationGraph.clearMain();
                this.animationGraph.emitter.emit('enLight');
                this.currentLevel.currentRoom.killEnemies(this.currentShape.shape);
                this.awaitingDrawing = false;
                this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.resume());
                this.animationGraph.fadeOutShape(this.currentShape.shape, this.recogListener.points);
                this.recogListener.addUserShape(this.currentShape.shape);
            } else {
                console.log('ouside');
                let p = this.add.particles('red');
                p.createEmitter({
                    scale:0.1,
                    speed:{min:-10,max:10},
                    alpha: { start: 1, end: 0 },
                    blendMode:'SCREEN',
                    on:false
                });
                GameModule.normalizePointName(this.recogListener.points).forEach((pt) => p.emitParticleAt(pt.x,pt.y));
                // let imgs: Phaser.GameObjects.Image[] = [];
                // for (let p of GameModule.normalizePointName(this.recogListener.points)) {
                //     imgs.push(this.add.image(p.x, p.y, 'red').setScale(0.2));
                // }
                // let tw = this.add.tween({
                //     targets: imgs,
                //     alpha: 0,
                //     duration: 1500,
                //     ease: 'Cubic.Out',
                //     onComplete: () => imgs.forEach((img) => img.destroy())
                // });
            }
            this.info.setText('Results :' + result.Name + " " + result.Score + "\ncumul: " + cumul);
            if (result.Score < 0.9) {
                this.currentShapeTxt.setText('Not Good Enough!');
            } else this.currentShapeTxt.setText(result.Name);

            // if (result[0].Score - result[1].Score > 0.15) {
            //   this.currentShapeTxt.setText(result[0].Name);
            //   this.currentLevel.currentRoom.killEnemies(result[0].Name);
            // } else this.currentShapeTxt.setText("UNDEFINED");
        });
        this.input.on('pointerdown', (pointer) => {
            this.recogListener.emitter.emit('pointerdown', pointer);
        });
        this.input.on('pointermove', (pointer) => {
            this.recogListener.emitter.emit('pointermove', pointer);
        });
        this.input.on('pointerup', (pointer) => {
            this.recogListener.emitter.emit('pointerup', pointer);
        });

    }
}