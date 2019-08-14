import 'phaser'
import { SCENE_GAME } from '../constants/Constants'
import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric'
import { CLASSIC } from 'phaser3-plugin-isometric/src/Projector';
import Cube from 'phaser3-plugin-isometric/src/Cube';
import Level from '../objects/core/Level';
import Renderer, { renderer } from '../objects/render/Renderer';
import { _ } from 'underscore';
import RecogListener from '../objects/recognizer/RecogListener';
import Loader from '../objects/utils/Loader';
// import { MapRenderer } from '../objects/render/MapRenderer';
// import Tile from '../objects/render/Tile';
import { LOCATION, INTERACTION_EVENT } from '../constants/Enums';
import { Game } from 'phaser';
import ArrayUtils from '../objects/utils/ArrayUtils';
import AnimationGraph from '../objects/render/AnimationGraph';
import { currentScene } from './TutorialScene';


export default class GameScene extends Phaser.Scene {

  static STATES = { 'RECOG': 'RECOG', 'IDLE': 'IDLE' ,'TUTORIAL':'TUTORIAL'};

  private _activeState = GameScene.STATES.IDLE;

  graphics: Phaser.GameObjects.Graphics;
  currentLevel: Level;
  recogListener: RecogListener;

  info: Phaser.GameObjects.Text;
  info2: Phaser.GameObjects.Text;
  currentShape: Phaser.GameObjects.Text;

  projectionText: string = "NONE";
  // selectedTile: Tile;

  isPause = false;
  pauseBtn: Phaser.GameObjects.Sprite;

  _screenSize: number;

  animationGraph: AnimationGraph;

  constructor() {
    super(SCENE_GAME);
    // currentScene = this;
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

  create = () => {

    this.children.sortChildrenFlag = true;
    //EVENT
    this.input.keyboard.createCursorKeys();
    this.initEvents();

    // ISO PLUGIN
    // this.isoPhysics.world.gravity.setTo(0, 0, -500);
    let rx = 0.5 * window.innerWidth / this.sys.game.canvas.width;
    let ry = 0.75 * window.innerHeight / this.sys.game.canvas.height;
    this.iso.projector.origin.setTo(rx, ry);
    this.iso.projector.projectionAngle = CLASSIC;

    // GRAPHICS
    this.currentShape = this.add.text(window.innerWidth * 0.35, window.innerHeight * 0.2, '', { font: '30px Arial', fill: '#ff0000' });
    this.info = this.add.text(50, 50, this.projectionText, { color: 'red', size: '50px' });
    //LEVEL
    this.currentLevel = Loader.loadLevel(this.cache.json.get('level_big').Level);
    this.currentLevel.preload();
    this.currentLevel.create();
    renderer.renderRoom(this.currentLevel.currentRoom);
    renderer.renderPlayer();

    this.activeState = GameScene.STATES.IDLE;

    console.log('iso', this.iso);
    console.log('physics', this.isoPhysics);
    console.log("Level", this.currentLevel);
    console.log("Renderer", renderer);
 
    let s = this.add.image(20, window.innerHeight * 0.2, 'button_green');
    s.setInteractive(currentScene.input.makePixelPerfect(100));
    s.on('pointerup', () => {
      if (this.activeState == GameScene.STATES.IDLE) {
        s.texture.manager.setTexture(s, 'button_red');
        this.activeState = GameScene.STATES.RECOG;
      } else {
        s.texture.manager.setTexture(s, 'button_green');
        this.activeState = GameScene.STATES.IDLE;
      }
    });
    // let squareW=window.innerWidth*0.5;
    // this.animationGraph.drawHollowRect(window.innerWidth*0.5-squareW/2,window.innerHeight*0.5-squareW/2,squareW,squareW,squareW*0.55,squareW*0.55,0xffffff,0.3);
  }

  update(time: number, delta: number) {
    this.currentLevel.update(time, delta);
    this.animationGraph.update(time,delta);

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

  initEvents() {//Events should be down in room
    this.events.addListener('shapeDrown', ({ result, list }) => {
      // if(!result) {
      //   this.currentShape.setText("NO RESULTS");
      //   return;
      // }
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
        if(prev) cumul+=ordered[shape]-prev;
        prev=ordered[shape]; 
      }
      console.log('cumul = '+cumul, ordered);
      this.info.setText('Results :' + result.Name + " " + result.Score+"\ncumul: "+cumul);
      console.log('results ' + result.Name + " " + result.Score, list);
      if (result.Score < 0.9) {
        this.currentShape.setText('Not Good Enough!');
      } else this.currentShape.setText(result.Name);

      // if (result[0].Score - result[1].Score > 0.15) {
      //   this.currentShape.setText(result[0].Name);
      //   this.currentLevel.currentRoom.killEnemies(result[0].Name);
      // } else this.currentShape.setText("UNDEFINED");
    });
    this.input.on('pointerdown', (pointer) => {
      if (this.isPause) return;
      if(this.activeState == GameScene.STATES.RECOG) this.recogListener.emitter.emit('pointerdown', pointer);

    });
    this.input.on('pointermove', (pointer) => {
      if (this.isPause) return;
      if(this.activeState == GameScene.STATES.RECOG) this.recogListener.emitter.emit('pointermove', pointer);
    });
    this.input.on('pointerup', (pointer) => {
      if (this.isPause) return;
      if(this.activeState == GameScene.STATES.RECOG) this.recogListener.emitter.emit('pointerup', pointer);
    });

    renderer.emitter.addListener(INTERACTION_EVENT.ENTRY_CLICK, (location: string) => {
      if (this.activeState !== GameScene.STATES.IDLE) return;
      let r = this.currentLevel.currentRoom;
      console.log('go to ' + location + ' from ' + r._id);
      let dest = r._entries[location].dest
      console.log(dest);
      renderer.renderTransition(r, dest, () => { console.log('callback'); this.currentLevel.currentRoom = dest; });
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
