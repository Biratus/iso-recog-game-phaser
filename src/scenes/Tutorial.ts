import { currentScene } from "./GameScene";
import Loader from "../objects/utils/Loader";
import EnemyManager from "../objects/core/EnemyManager";
import { renderer } from "../objects/render/Renderer";
import { LOCATION, ENEMY_TYPE } from "../constants/Enums";

export default class Tutorial {

    state = '';

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
    }

    constructor() {
        return this;
    }

    init() {

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
                currentScene.animationGraph.focusLight(en.sprite,'sq1');
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

    userInputShape(shape) {
        let totW = window.innerWidth;
        let totH = window.innerHeight;
        let size = 0.4 * totW;
        let holeSize = size * 0.6;
        switch (shape) {
            case 'SQUARE':
                let clearSquare = 1.2;
                // currentScene.animationGraph.clearSquareSpace((totW - size*clearSquare) / 2,(totH - size*clearSquare) / 2,clearSquare,clearSquare);
                currentScene.animationGraph.drawDashedHollowRect({
                    x: (totW - size) / 2,
                    y: (totH - size) / 2,
                    w: size, h: size,
                    dashGap: totW * 0.01, dashSize: totW * 0.02,
                    holeW: holeSize, holeH: holeSize,
                    rectColor:0xffffff,rectAlpha:0.8,
                    strokeColor:0xffffff,strokeAlpha:0.5
                });
                break;
        }

    }
}