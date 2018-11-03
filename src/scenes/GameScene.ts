import 'phaser'
import { SCENE_GAME } from '../constants/Constants'
import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric'
import { CLASSIC, ISOMETRIC, MILITARY } from 'phaser3-plugin-isometric/src/Projector';
import Cube from 'phaser3-plugin-isometric/src/Cube';
import Level from '../objects/core/Level';
import Renderer, { renderer } from '../objects/render/Renderer';
import { _ } from 'underscore';
import RecogListener from '../objects/recognizer/RecogListener';
import Loader from '../objects/utils/Loader';

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
    // this.recogListener = new RecogListener();
  }

  create = () => {

    this.children.sortChildrenFlag = true;
    //EVENT
    // this.input.keyboard.createCursorKeys();
    // this.initEvents();

    // ISO PLUGIN
    // this.isoPhysics.world.gravity.setTo(0, 0, -500);
    let rx = 0.5 * window.innerWidth / this.sys.game.canvas.width;
    let ry = 0.5 * window.innerHeight / this.sys.game.canvas.height;
    this.iso.projector.origin.setTo(rx, ry);
    this.projectionText = 'CLASSIC';
    this.iso.projector.projectionAngle = CLASSIC;

    // GRAPHICS
    this.graphics = this.add.graphics({
      x: 0, y: 0,
      lineStyle: { color: 0xffffff, width: 10 },
      fillStyle: { color: 0xffff00, alpha: 1 }
    });

    this.input.once('pointerup', (pointer) => {
      // const projections=[[ISOMETRIC,'ISOMETRIC'],[CLASSIC,'CLASSIC'],[MILITARY,'MILITARY'],[Math.atan(65/111),'Math.atan(65/111)'],[120,'120'],[Math.PI/8,'Math.PI/8'],[Math.PI/4,'Math.PI/4']];
      // for(let proj of projections) {
      //   this.downloadPlane(proj);
      // }

      // this.downloadCube([Math.PI/4,'Math.PI/8=4']);
      // this.downloadPlane([Math.PI/4,'Math.PI/4']);

      this.downloadFullCube([CLASSIC, 'CLASSIC']);
      this.downloadElongatedCube([CLASSIC, 'CLASSIC'],0.7,1.5);
    });

    // this.pauseBtn = this.add.sprite(50, 50, 'tileCube').setInteractive();
    // this.pauseBtn.on('pointerup', () => this.isPause ? this.resume() : this.pause());

    // this.info = this.add.text(10, 10, '', { font: '12px Arial', fill: '#ffffff' });
    // this.info2 = this.add.text(0.5 * window.innerWidth, 10,
    //   "innerW: " + window.innerWidth + " gameW: " + this.sys.game.canvas.width +
    //   "\ninnerH: " + window.innerHeight + " gameH: " + this.sys.game.canvas.height +
    //   '\nScreen Size: ' + this._screenSize +
    //   '\nFPS: ' + this.game.loop.actualFps + ' target: ' + this.game.loop.targetFps, { font: '12px Arial', fill: '#ffffff' });
    // this.currentShape = this.add.text(window.innerWidth *0.35, window.innerHeight * 0.2, '', { font: '30px Arial', fill: '#ff0000' });

    // //LEVEL
    // this.currentLevel = Loader.loadLevel(this.cache.json.get('level_test1').Level);
    // this.currentLevel.init();
    // renderer.renderLevel(this.currentLevel);

    // this.recogListener.disable();


    console.log('iso', this.iso);
    console.log('physics', this.isoPhysics);
    console.log("Level", this.currentLevel);
    console.log("Renderer", renderer);

    // this.buildAxes();
  }

  downloadCube(projection) {
    this.projectionText = projection[1];
    this.iso.projector.projectionAngle = projection[0];
    let factor = 0.5;

    // draw 1 cube
    let cube = new Cube(0, 0, 0, window.innerWidth * factor, window.innerWidth * factor, window.innerWidth * factor);
    let sides = [
      [3, 7, 6, 2, 3, 1, 5, 4, 6], [7, 5]
    ];
    let corners = cube.getCorners();
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let graph = canvas.getContext('2d');
    graph!.strokeStyle = "#000000";
    graph!.lineWidth = 1;
    for (let path of sides) {
      let pt = this.iso.projector.project(corners[path[0]]);
      graph!.moveTo(pt.x, pt.y);
      for (let i = 1; i < path.length; i++) {
        pt = this.iso.projector.project(corners[path[i]]);
        graph!.lineTo(pt.x, pt.y);
      }
      graph!.stroke();
    }
    document.body.appendChild(canvas);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute('style', "display: none");
    let img = new Image();
    img.src = canvas.toDataURL();
    a.href = img.src;
    a.download = this.projectionText + '.png';
    a.click();
  }

  downloadPlane(projection) {
    let sides = [
      [3, 7, 6, 2, 3, 1, 5, 4, 6], [7, 5]
    ];
    this.iso.projector.projectionAngle = projection[0];
    this.projectionText = projection[1];
    let factor = 0.1;
    let initZ = -3 * window.innerWidth * factor;
    let canvasPlane = document.createElement('canvas');
    canvasPlane.width = window.innerWidth;
    canvasPlane.height = window.innerHeight;
    let graphPlane = canvasPlane.getContext('2d');
    let size = 5;
    let topface = [[1, 3, 7, 5, 1]];
    let topleftface = [[1, 5, 7, 6, 2, 3, 1], [3, 7]];
    let toprightface = [[1, 5, 7, 6, 4, 5, 1], [5, 7]];
    graphPlane!.strokeRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = -size / 2; i < size; i++) {
      for (let j = -size / 2; j < size; j++) {
        let cube = new Cube(i * window.innerWidth * factor, j * window.innerWidth * factor, initZ, window.innerWidth * factor, window.innerWidth * factor, window.innerWidth * factor);
        let corners = cube.getCorners();
        let toDrawSides = (i < size - 1 && j < size - 1) ? topface : (i == size - 1 ? (j == size - 1 ? sides : toprightface) : topleftface);
        for (let path of toDrawSides) {
          let pt = this.iso.projector.project(corners[path[0]]);
          graphPlane!.moveTo(pt.x, pt.y);
          for (let i = 1; i < path.length; i++) {
            pt = this.iso.projector.project(corners[path[i]]);
            graphPlane!.lineTo(pt.x, pt.y);
          }
          graphPlane!.stroke();
        }
      }
    }
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute('style', "display: none");
    let img = new Image();
    img.src = canvasPlane.toDataURL();
    a.href = img.src;
    a.download = this.projectionText + '_plane_lowered_f' + factor + '_size' + size + '.png';
    a.click();
  }

  downloadElongatedCube(projection, width, sizeZ) {
    this.projectionText = projection[1];
    this.iso.projector.projectionAngle = projection[0];
    let factor = 0.5;

    // draw 1 cube
    let cube = new Cube(0, 0, 0, window.innerWidth * factor * width, window.innerWidth * factor * width, window.innerWidth * factor * sizeZ);
    let sides = [
      [3, 7, 6, 2, 3, 1, 5, 4, 6], [7, 5]
    ];
    let corners = cube.getCorners();
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let graph = canvas.getContext('2d');
    graph!.strokeStyle = "#000000";
    graph!.lineWidth = 1;
    for (let path of sides) {
      let pt = this.iso.projector.project(corners[path[0]]);
      graph!.moveTo(pt.x, pt.y);
      for (let i = 1; i < path.length; i++) {
        pt = this.iso.projector.project(corners[path[i]]);
        graph!.lineTo(pt.x, pt.y);
      }
      graph!.stroke();
    }
    document.body.appendChild(canvas);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute('style', "display: none");
    let img = new Image();
    img.src = canvas.toDataURL();
    a.href = img.src;
    a.download = this.projectionText + '_Elongated _w'+width+'_Z'+sizeZ+'.png';
    a.click();
  }

  downloadFullCube(projection) {
    this.projectionText = projection[1];
    this.iso.projector.projectionAngle = projection[0];
    let factor = 0.5;

    // draw 1 cube
    let cube = new Cube(0, 0, 0, window.innerWidth * factor, window.innerWidth * factor, window.innerWidth * factor);
    let sides = [
      [0,1,3,2,6,7,5,4,0,1,5],[3,7],[2,0],[4,6]
    ];
    let corners = cube.getCorners();
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let graph = canvas.getContext('2d');
    graph!.strokeStyle = "#000000";
    graph!.lineWidth = 1;
    for (let path of sides) {
      let pt = this.iso.projector.project(corners[path[0]]);
      graph!.moveTo(pt.x, pt.y);
      for (let i = 1; i < path.length; i++) {
        pt = this.iso.projector.project(corners[path[i]]);
        graph!.lineTo(pt.x, pt.y);
      }
      graph!.stroke();
    }
    document.body.appendChild(canvas);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute('style', "display: none");
    let img = new Image();
    img.src = canvas.toDataURL();
    a.href = img.src;
    a.download = this.projectionText + '_Full.png';
    a.click();
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
      this.input.on('pointerup', (pointer) => {
        if (this.isPause) return;
        this.recogListener.emitter.emit('pointerup', pointer);
      });
      this.currentLevel.currentRoom.getAllEnemiesManager().forEach((enMana) => enMana.start());
      this.recogListener.enable();

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
