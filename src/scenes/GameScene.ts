import 'phaser'
import { SCENE_GAME } from '../constants/Constants'
import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric'
import Level from '../objects/core/Level';
import Renderer, { renderer } from '../objects/render/Renderer';
import { _ } from 'underscore';
import RecogListener from '../objects/recognizer/RecogListener';

export var currentScene: GameScene;

export default class GameScene extends Phaser.Scene {

  graphics: Phaser.GameObjects.Graphics;
  currentLevel: Level;
  recogListener: RecogListener;
  info: Phaser.GameObjects.Text;

  _screenSize:number;

  constructor() {
    super(SCENE_GAME);
    currentScene = this;
    Renderer.init();
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
    this._screenSize=Phaser.Math.Distance.Between(0,0,this.game.canvas.width,this.game.canvas.height);
    this.recogListener = new RecogListener();
  }

  create = () => {

    this.children.sortChildrenFlag = true;
    //EVENT
    this.initEvents();
    this.info = this.add.text(10, 10, '', { font: '15px Arial', fill: '#ffffff' });

    // ISO PLUGIN
    // this.isoPhysics.world.gravity.setTo(0, 0, -500);
    let rx = 0.5 * window.innerWidth / this.sys.game.canvas.width;
    let ry = 0.5 * window.innerHeight / this.sys.game.canvas.width;
    console.log('iso', this.iso);
    console.log('physics', this.isoPhysics);
    this.iso.projector.origin.setTo(rx, ry);
    this.iso.projector.projectionAngle = Math.atan(65 / 111);

    // GRAPHICS
    this.graphics = this.add.graphics({
      x: 0, y: 0,
      lineStyle: { color: 0xffff00, width: 1 },
      fillStyle: { color: 0xffff00, alpha: 1 }
    });

    // this.currentLevel = Loader.loadLevel(this.cache.json.get('level_big').Level);
    // this.currentLevel.init();
    // console.log("Level", this.currentLevel);

    // renderer.renderLevel(this.currentLevel);

    console.log("Renderer", renderer);

    this.children.sortChildrenFlag = true;

    this.input.keyboard.createCursorKeys();

    // this.buildAxes();
  }

  update(time: number, delta: number) {

  }

  initEvents() {
    this.events.addListener('shapeDrown', (result) => {
      console.log('results ' + result[0].Name + " " + result[0].Score, result);
        this.info.setText('Results :'+_.reduce(result, (acc,elt) => acc+'\n'+elt.Name+" "+elt.Score,'')+'\nScreen Size: '+this._screenSize) ;
    });
    this.input.on('pointerdown', (pointer) => {
      this.graphics.clear();
      this.graphics.fillCircle(pointer.x, pointer.y, 2);
      this.recogListener.emitter.emit('pointerdown', pointer);

    });
    this.input.on('pointermove', (pointer) => {
      this.graphics.fillCircle(pointer.x, pointer.y, 2);
      this.recogListener.emitter.emit('pointermove', pointer);
    });
    this.input.on('pointerup', (pointer) => {
      this.recogListener.emitter.emit('pointerup', pointer);

    });
  }

  drawPoints(points,color,clear) {
    let initColor = this.graphics.defaultFillColor;
    if(clear) this.graphics.clear();
    if(color) this.graphics.fillStyle(color,1);
    for(let p of points) {
      this.graphics.fillCircle(p.X, p.Y, 2);
    }
    this.graphics.defaultFillColor=initColor;
  }

  get screenSize() {return this._screenSize;}
}
