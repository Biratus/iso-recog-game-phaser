import 'phaser';
import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric';
import { CLASSIC } from 'phaser3-plugin-isometric/src/Projector';
import { SCENE_GAME, GAME_CONFIG } from '../constants/Constants';
// import { MapRenderer } from '../objects/render/MapRenderer';
// import Tile from '../objects/render/Tile';
import { EVENTS } from '../constants/Enums';
import Level from '../objects/core/Level';
import RecogListener from '../objects/recognizer/RecogListener';
import AnimationGraph from '../objects/render/AnimationGraph';
import Renderer, { renderer } from '../objects/render/Renderer';
import { Location } from '../constants/Location';
import { GameModule } from '../utils/GameModule';
import Loader from '../utils/Loader';

export default class GameScene extends Phaser.Scene {

  static STATES = { 'RECOG': 'RECOG', 'IDLE': 'IDLE' };

  private _activeState = GameScene.STATES.IDLE;

  graphics: Phaser.GameObjects.Graphics;
  currentLevel: Level;
  recogListener: RecogListener;

  info: Phaser.GameObjects.Text;
  info2: Phaser.GameObjects.Text;
  currentShape: Phaser.GameObjects.Text;

  // selectedTile: Tile;

  isPause = false;
  pauseBtn: Phaser.GameObjects.Sprite;

  _screenSize: number;

  animationGraph: AnimationGraph;

  constructor() {
    super(SCENE_GAME);
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
    this._screenSize = Phaser.Math.Distance.Between(0, 0, GameModule.width(), GameModule.height());
    this.recogListener = new RecogListener(this.events);
    this.animationGraph = new AnimationGraph(this.add.graphics({
      x: 0, y: 0,
      lineStyle: { color: 0xffffff, width: 10 },
      fillStyle: { color: 0xff0000, alpha: 1 }
    }));
    Renderer.init();
  }

  create = () => {

    this.children.sortChildrenFlag = true;
    //EVENT
    this.input.keyboard.createCursorKeys();
    this.initEvents();

    // ISO PLUGIN
    // this.isoPhysics.world.gravity.setTo(0, 0, -500);
    let rx = 0.5 * GameModule.width() / this.sys.game.canvas.width;
    let ry = 0.5 * GameModule.height() / this.sys.game.canvas.height;
    this.iso.projector.origin.setTo(rx, ry);
    this.iso.projector.projectionAngle = CLASSIC;

    // GRAPHICS
    // this.currentShape = this.add.text(GameModule.width() * 0.35, GameModule.height() * 0.2, '', { font: '30px Arial', fill: '#ff0000' });
    this.info = this.add.text(50, 50, '', { color: 'red', size: '20px' });
    //LEVEL 
    this.currentLevel = Loader.loadLevel(this.cache.json.get('level_test').Level);
    this.currentLevel.preload();
    this.currentLevel.create();
    renderer.renderRoom(this.currentLevel.currentRoom);

    console.log('iso', this.iso);
    console.log('physics', this.isoPhysics);
    console.log("Level", this.currentLevel);
    console.log("Renderer", renderer);

    // START GAME
    this.activeState = GameScene.STATES.RECOG;
    this.resume();
    // this.info.setText(renderer.smokeEntry('TOP'))

    // let s = this.add.image(20, GameModule.height() * 0.2, 'button_green');
    // s.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
    // s.on('pointerup', () => {
    //   t.destroy();
    // if (this.activeState == GameScene.STATES.IDLE) {
    //   s.texture.manager.setTexture(s, 'button_red');
    //   this.activeState = GameScene.STATES.RECOG;
    // } else {
    //   s.texture.manager.setTexture(s, 'button_green');
    //   this.activeState = GameScene.STATES.IDLE;
    // }
    // });

    //DEBUG
    // let debugBtn = this.add.image(GameModule.width() * 0.7, 0, 'button_red');
    // debugBtn.setInteractive(GameModule.currentScene.input.makePixelPerfect(100));
    // debugBtn.on('pointerdown', () => {
    //   console.log('GameModule.currentScene', this);
    //   // this.info.setText(renderer.smokeEntry('TOP'));


    // });
    // let squareW=GameModule.width()*0.5;
    // this.animationGraph.drawHollowRect(GameModule.width()*0.5-squareW/2,GameModule.height()*0.5-squareW/2,squareW,squareW,squareW*0.55,squareW*0.55,0xffffff,0.3);
  }

  update(time: number, delta: number) {
    this.currentLevel.update(time, delta);
    renderer.update(time, delta);
    this.info.setText('fps :' + (1000 / delta).toFixed(3) 
      + '\ncombo: x' + this.currentLevel.currentRoom.combo
      + '\nRoom id: ' + this.currentLevel.currentRoom.id);
    this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => {
      if (enMana.isOver()) {
        renderer.emitter.emit(EVENTS.ENTRY_SMOKE + Location.name(enMana.entry.location));
      }
    });
    this.animationGraph.update(time, delta);
  }

  pause() {
    this.isPause = true;
    this.recogListener.disable();
    this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.pause());
  }

  resume() {
    this.isPause = false;
    this.recogListener.enable();
    if (this.activeState != GameScene.STATES.RECOG) console.warn('NOT IN RECOG MODE');
    else this.startEnemyManagers();

  }

  initEvents() {//Events should be down in room
    this.events.addListener(EVENTS.SHAPE_DRAWN, ({ result, list }) => {
      if (!result || !list) {
        // this.currentShape.setText("NO RESULTS");
        return;
      }

      if (result.Score < GAME_CONFIG.recog_threshold) {// BAD !!!
        this.currentLevel.currentRoom.combo = 1;
        renderer.fadeOutPoints(this.recogListener.points, 'red', 10);
        // this.currentShape.setText('Not Good Enough!');
      } else {// GOOD !!
        this.currentLevel.currentRoom.combo += 2;
        renderer.fadeOutPoints(this.recogListener.points, 'blue', 30);
        // this.currentShape.setText(result.Name);
        this.currentLevel.currentRoom.killEnemies(result.Name);
      }
    });
    this.input.on('pointerdown', (pointer) => {
      if (this.isPause) return;
      if (this.activeState == GameScene.STATES.RECOG) this.recogListener.emitter.emit('pointerdown', pointer);

    });
    this.input.on('pointermove', (pointer) => {
      if (this.isPause) return;
      if (this.activeState == GameScene.STATES.RECOG) this.recogListener.emitter.emit('pointermove', pointer);
    });
    this.input.on('pointerup', (pointer) => {
      if (this.isPause) return;
      if (this.activeState == GameScene.STATES.RECOG) this.recogListener.emitter.emit('pointerup', pointer);
    });
    renderer.emitter.addListener(EVENTS.ENTRY_CLICK, (location: string) => {
      if (this.activeState !== GameScene.STATES.IDLE) return;
      renderer.emitter.emit(EVENTS.TAP_INDICATION);
      let r = this.currentLevel.currentRoom;
      let dest = r._entries[location].dest;
      renderer.renderTransition(r, dest, () => {
        this.activeState = GameScene.STATES.RECOG;
        if(GameModule.friendly) this.activeState = GameScene.STATES.IDLE;
        this.currentLevel.currentRoom = dest;
        this.startEnemyManagers();
      });
    });

    this.events.addListener(EVENTS.REACH_CENTER, (en, enMana) => {
      renderer.playerTakeHit(enMana.entry);
    });
    this.events.addListener(EVENTS.WAVE_END, () => {
      this.activeState = GameScene.STATES.IDLE;
    });
  }
  
  startEnemyManagers() {
    this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => {
      if (!enMana.isOver()) renderer.smokeEntry(Location.name(enMana.entry.location)!);
      if(!GameModule.friendly) enMana.start();
    });
  }

  drawPoints(points, color, clear) {
    let initColor = this.graphics.defaultFillColor;
    if (clear) this.graphics.clear();
    if (color) this.graphics.fillStyle(color, 1);
    for (let p of points) {
      this.graphics.fillCircle(p.X, p.Y, 2);
    }
    this.graphics.defaultFillColor = initColor;
  }

  get screenSize() { return this._screenSize; }

  get activeState() { return this._activeState; }

  set activeState(val) {
    if (val === GameScene.STATES.RECOG) this.recogListener.enable();
    else this.recogListener.disable();
    this._activeState = val;
  }
}
