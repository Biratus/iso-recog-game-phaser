import GameScene, { currentScene } from "./GameScene";
import Loader from "../objects/utils/Loader";
import EnemyManager from "../objects/core/EnemyManager";
import { renderer } from "../objects/render/Renderer";
import { LOCATION, ENEMY_TYPE } from "../constants/Enums";
import RecogListener from "../objects/recognizer/RecogListener";
import { RenderUtils } from "../objects/utils/RenderUtils";

export default class Tutorial {

    state = '';
    private static instance;
    private pointerDown;
    private pointerMove;
    private pointerUp;
    private recogListener;
    listener = new Phaser.Events.EventEmitter();
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

    static start() {
        new Tutorial().init();
        currentScene.activeState = GameScene.STATES.TUTORIAL;
    }

    constructor() {
        Tutorial.instance = this;
        this.recogListener = new RecogListener(this.listener);
        return this;
    }

    private init() {
        currentScene.currentLevel = Loader.loadLevel(currentScene.cache.json.get('tutorial').Level);
        currentScene.currentLevel.preload();
        renderer.renderRoom(currentScene.currentLevel.currentRoom);
        renderer.renderPlayer();

        let e = currentScene.currentLevel.currentRoom.entries()[0];
        e.enemyManager = new EnemyManager(e);
        let re = renderer.getEntryTopBackLocationAt(LOCATION.name(e.location));

        re.texture = 'en_sm_' + e.sign.toLocaleLowerCase();
        console.log('config ', re);
        let en = e.enemyManager.createEnemy(re, ENEMY_TYPE.SMALL, {
            name: 'sq1', run: (en, enMana) => {
                en.sprite.isoX = re.x;
                en.sprite.isoY = re.y;
                currentScene.animationGraph.focusLight(en.sprite, 'sq1');
                this.userInputShape(e.sign);
            }
        });

        en.emitter.emit('sq1', e.enemyManager);
        console.log('Entry loc: ' + LOCATION.name(e.location));
        console.log('Enemy', en);

        // currentScene.input.on('pointerup', (evt) => {
        //     this.steps[this.currentStep].next();
        // });
    }

    private userInputShape(shape) {
        let totW = window.innerWidth;
        let totH = window.innerHeight;
        let size = 0.4 * totW;
        let holeSize = size * 0.6;
        switch (shape) {
            case 'SQUARE':
                let clearSquare = 1.2;
                // currentScene.animationGraph.clearSquareSpace((totW - size*clearSquare) / 2,(totH - size*clearSquare) / 2,clearSquare,clearSquare);
                let x = (totW - size) / 2, y = (totH - size) / 2;
                currentScene.animationGraph.drawDashedHollowRect({
                    x: x,
                    y: y,
                    w: size, h: size,
                    dashGap: totW * 0.01, dashSize: totW * 0.02,
                    holeW: holeSize, holeH: holeSize,
                    rectColor: 0x000000, rectAlpha: 1,
                    strokeColor: 0xffffff, strokeAlpha: 0.5
                });
                let topX = x + (size - holeSize) / 4;
                let topY = y + (size - holeSize) / 4;
                this.pointerDown = (p) => {
                    this.recogListener.emitter.emit('pointerdown', p);
                    currentScene.animationGraph.emitter.emit('stopCircleAnim');
                };
                this.pointerUp = (p) => {
                    if (RenderUtils.pointsInRect(this.recogListener.points, { x: x, y: y, w: size, h: size }) &&
                        !RenderUtils.pointsInRect(this.recogListener.points, { x: x + (size - holeSize) / 2, y: y + (size - holeSize) / 2, w: holeSize, h: holeSize })) {
                            console.log('in');
                            // this.recogListener.emitter.emit('pointerup', p);

                    } else {
                        console.log('out');
                        this.userInputShape(shape);
                    }
                    this.recogListener.graphics.clear();
                };
                this.pointerMove = (p) => {
                    this.recogListener.emitter.emit('pointermove', p);
                };
                this.listener.addListener('shapeDrown', (p) => {
                    console.log('shape drown',p);
                });
                currentScene.animationGraph.animateFadeDownCircle(topX, topY, topY + size * 0.6, 0x00ff00, (((size - holeSize) / 2) * 1) / 2, 1500, true, 'stopCircleAnim');
                this.recogListener.enable();
                break;
        }

    }
    static pointerDown(p) {
        Tutorial.instance.pointerDown(p)
    }

    static pointerMove(p) {
        Tutorial.instance.pointerMove(p)
    }

    static pointerUp(p) {
        Tutorial.instance.pointerUp(p)
    }
}