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
import Wireframe from '../objects/render/Wireframe';
import Colorized from '../objects/render/Colorized';
import IsoColor from '../objects/render/IsoColor';

export var currentScene: GameScene;

const colorsHex = {
  blue_violet: ['#A88088', '#9B7C84', '#7C6C77', '#956573', '#5F4C60', '#464155'],
  red: ['#FDE4E0', '#FED9D1', '#FFABA9', '#FEBAB1', '#FD7575', '#ED5756', '#9F3B3B', '#4F1E1A'],
  violet: ['#FED0DD', '#FD85AE', '#F35BA3', '#A93C8D', '#742E76', '#341A49'],
  blue: ['#E8F6FE', '#DAF0FD', '#D2E8FD', '#ADD4FD', '#99C8FB', '#5AA6FE', '#457BE7', '#245598', '#17294D'],
  green: ['#C5DECD', '#9BC6A9', '#82BB95', '#79B288', '#5EA178', '#55966B', '#51926A', '#407853', '#2D6349', '#154841', '#0C3837', '#05282E'],
  yellow: ['#D6E892', '#A8AE51', '#91813C', '#977838', '#886932', '#746431']
};
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

  countColor = 0;
  doneCombi: string[] = [];



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

    this.input.on('pointerup', (pointer) => {
      // setInterval(() => {

        let colors = ['blue_violet', 'red', 'violet', 'blue', 'green', 'yellow'];
      //   this.downloadCubes(colors[this.countColor++]);
      //   if (this.countColor >= colors.length) this.countColor = 0;
      // },10*1000);
      // const projections=[[ISOMETRIC,'ISOMETRIC'],[CLASSIC,'CLASSIC'],[MILITARY,'MILITARY'],[Math.atan(65/111),'Math.atan(65/111)'],[120,'120'],[Math.PI/8,'Math.PI/8'],[Math.PI/4,'Math.PI/4']];
      // for(let proj of projections) {
      //   Wireframe.downloadPlane(proj);
      // }

      // Wireframe.downloadCube([Math.PI/4,'Math.PI/8=4']);
      // Wireframe.downloadPlane([Math.PI/4,'Math.PI/4']);

      // Wireframe.downloadFullCube([CLASSIC, 'CLASSIC']);
      // Wireframe.downloadElongatedCube([CLASSIC, 'CLASSIC'],0.7,1.5);

      // Colorized.downloadCube([CLASSIC,'CLASSIC'],new IsoColor('#D8E7E2','#688490','#364A53'));
      // Colorized.downloadElongatedCube([CLASSIC, 'CLASSIC'], 1, 0.5, new IsoColor('#D8E7E2', '#688490', '#364A53'));
      let color=colorsHex.blue;
      // color.splice(Math.floor(0.7*color.length),color.length);
      color=['#E8F6FE', '#DAF0FD', '#D2E8FD', '#ADD4FD', '#99C8FB'];
      Colorized.downloadElongatedCube([CLASSIC,'CLASSIC'],1,0.2,new IsoColor('#DAF0FD','#ADD4FD','#5AA6FE'));
      this.game.canvas.hidden=true;
    });
    console.log('iso', this.iso);
    console.log('physics', this.isoPhysics);
    console.log("Level", this.currentLevel);
    console.log("Renderer", renderer);
  }

  downloadCubes(key) {
    // draw triplets
    let count = 0;
    for (let iLight = 0; iLight < colorsHex[key].length - 2; iLight++) {
      for (let iMedium = iLight + 1; iMedium < colorsHex[key].length - 1; iMedium++) {
        for (let iDark = iMedium + 1; iDark < colorsHex[key].length; iDark++) {
          if (this.doneCombi.indexOf('CLASSIC_' + key + '_' + iLight + ',' + iMedium + ',' + iDark) >= 0) continue;
          console.log('CLASSIC_' + key + '_' + iLight + ',' + iMedium + ',' + iDark);
          this.doneCombi.push('CLASSIC_' + key + '_' + iLight + ',' + iMedium + ',' + iDark);
          Colorized.downloadCube([CLASSIC, 'CLASSIC_' + key + '_' + iLight + ',' + iMedium + ',' + iDark], new IsoColor(colorsHex[key][iLight], colorsHex[key][iMedium], colorsHex[key][iDark]))
          count++;
          if (count >= 10) return;
        }
      }
    }

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
