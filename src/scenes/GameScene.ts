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
import { MapRenderer } from '../objects/render/MapRenderer';
import Tile from '../objects/render/Tile';

export var currentScene: GameScene;

export default class GameScene extends Phaser.Scene {

  graphics: Phaser.GameObjects.Graphics;
  currentLevel: Level;
  recogListener: RecogListener;

  info: Phaser.GameObjects.Text;
  info2: Phaser.GameObjects.Text;
  currentShape: Phaser.GameObjects.Text;

  projectionText: string;

  isPause = false;
  pauseBtn: Phaser.GameObjects.Sprite;

  _screenSize: number;

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
    this._screenSize = Phaser.Math.Distance.Between(0, 0, window.innerWidth, window.innerHeight);
  }

  create = () => {

    this.children.sortChildrenFlag = true;
    //EVENT
    // this.input.keyboard.createCursorKeys();
    // this.initEvents();

    // ISO PLUGIN
    // this.isoPhysics.world.gravity.setTo(0, 0, -500);
    let rx = 0.5 * window.innerWidth / this.sys.game.canvas.width;
    let ry = 0.75 * window.innerHeight / this.sys.game.canvas.height;
    this.iso.projector.origin.setTo(rx, ry);
    this.iso.projector.projectionAngle = CLASSIC;

    // GRAPHICS
    this.graphics = this.add.graphics({
      x: 0, y: 0,
      lineStyle: { color: 0xffffff, width: 10 },
      fillStyle: { color: 0xffffff, alpha: 1 }
    });
    //LEVEL
    this.currentLevel = Loader.loadLevel(this.cache.json.get('level_test1').Level);
    this.currentLevel.init();
    // this.graphics.fillRect(0,0,window.innerWidth,window.innerHeight);//white screen
    renderer.renderLevel(this.currentLevel);

    renderer.buildUnderground();
    renderer.mapManager.rooms.forEach((room) => {
      let nbTile = Math.round(1+Math.random()*10);
      for(let i=0;i<=nbTile;i++) room.tiles[Math.floor(Math.random()*room.tiles.length)].destroy();
    });
    // renderer.hideRooms();


    console.log('iso', this.iso);
    console.log('physics', this.isoPhysics);
    console.log("Level", this.currentLevel);
    console.log("Renderer", renderer);
let origin=MapRenderer.getTileAt(0,0,0);
    console.log('origin tile',origin);

    console.log('gap: '+(origin!._neighbours.north!.sprite.isoBounds.frontY-origin!.sprite.isoBounds.backY));


    // this.buildAxes();
  }

  update(time: number, delta: number) {

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
    this.events.addListener('shapeDrown', (result) => {
      console.log('results ' + result[0].Name + " " + result[0].Score, result);

      if (result[0].Score - result[1].Score > 0.15) {
        this.currentShape.setText(result[0].Name);
        this.currentLevel.currentRoom.killEnemies(result[0].Name);
      } else this.currentShape.setText("UNDEFINED");

      this.info.setText('Results :' + _.reduce(result, (acc, elt) => acc + '\n' + elt.Name + " " + elt.Score, ''));
    });
    this.input.on('pointerdown', (pointer) => {
      if (this.isPause) return;
      this.recogListener.emitter.emit('pointerdown', pointer);

    });
    this.input.on('pointermove', (pointer) => {
      if (this.isPause) return;
      this.recogListener.emitter.emit('pointermove', pointer);
    });
    this.input.once('pointerup', (pointer) => {
      MapRenderer.forEachTile((tile:Tile,x,y,z) => {
        for(let loc in tile._neighbours) {
          if(tile._neighbours[loc] !== null && this.isoPhysics.world.collide(tile._neighbours[loc].sprite.body,tile.sprite.body)) {
            console.log(x+" "+" "+y+" "+z,tile);
            console.log("neigh "+loc,tile._neighbours[loc]);
            console.log('INTERSECT');
            return;
          }
        }
      });
      
      console.log('done');

      // this.input.on('pointerup', (pointer) => {
      //   if (this.isPause) return;
      //   this.recogListener.emitter.emit('pointerup', pointer);
      // });
      // this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.start());
      // this.recogListener.enable();

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
}
