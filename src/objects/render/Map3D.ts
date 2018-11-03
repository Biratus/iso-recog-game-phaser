import { GAME_CONFIG } from "../../constants/Constants";
import Tile from "./Tile";
import { renderer } from "./Renderer";
import { IsoSprite } from 'phaser3-plugin-isometric';
import { currentScene } from "../../scenes/GameScene";


export default class Map3D {
  map: Phaser.Structs.Map<number, Phaser.Structs.Map<number, Phaser.Structs.Map<number, Tile>>>;
  scene: Phaser.Scene;
  constructor(scene:Phaser.Scene) {
    this.map = new Phaser.Structs.Map([]);
    this.scene = scene;
  }
  getTileAt (x, y, z): Tile | undefined { return this.isEmpty(x, y, z) ? undefined : this.map.get(x).get(y).get(z); }
  setTileAt = (x, y, z, key): Tile => {
    if (!this.isEmpty(x, y, z)) {
      this.getTileAt(x, y, z)!.destroy();
    }
    if (!this.map.get(x)) this.map.set(x, new Phaser.Structs.Map([]));
    if (!this.map.get(x).get(y)) this.map.get(x).set(y, new Phaser.Structs.Map([]));
    if (x == null || y == null || z == null || key == null) console.error("x y or z might not have been defined to set tile");

    let t = renderer.addGroundLayer(x, y, z, key)

    t.isoX *= GAME_CONFIG.scale * GAME_CONFIG.tile_size;//t.width;
    t.isoY *= GAME_CONFIG.scale * GAME_CONFIG.tile_size;//t.width;
    t.isoZ *= GAME_CONFIG.scale * GAME_CONFIG.tile_height;//t.height;


    let tile = new Tile(x, y, z, t);
    this.map.get(x).get(y).set(z, tile);
    if(GAME_CONFIG.enablePhysics) currentScene.isoPhysics.world.enable(tile.sprite);
    this.fillNeighbours(x, y, z, tile);
    return tile;
  }
  isEmpty = (x, y, z): boolean => {
    let argumentsLength = (x != undefined ? 1 : 0) + (y != undefined ? 1 : 0) + (z != undefined ? 1 : 0);
    // console.log('arg length '+argumentsLength);
    switch (argumentsLength) {
      case 0: return this.map.size == 0;
      case 1: {
        if (x != undefined) return !this.map.has(x);

        if (y != undefined) {
          for (let x1 of this.map.keys()) if (this.map.get(x1).has(y)) return false;
          return true;
        }
        if (z != undefined) {
          for (let x1 of this.map.keys()) for (let y1 of this.map.get(x1).keys()) if (this.map.get(x1).get(y1).has(z)) return false;
          return true;
        }
      }
      case 3: {
        if (this.map.has(x)) {
          return this.map.get(x).has(y) ? !this.map.get(x).get(y).has(z) : true;
        }
        return true;
      }
      case 2: {
        if (x == undefined) {//y and z
          for (let x1 of this.map.keys()) if (this.map.get(x1).has(y)) return !this.map.get(x1).get(y).has(z);
          return true
        }
        if (y == undefined) {//x and z
          if (this.map.has(x)) {
            for (let y1 of this.map.get(x).keys()) {
              if (this.map.get(x).get(y1).has(z)) return false;
            }
          }
          return true;
        }
        if (z == undefined) {//x and y
          return this.map.has(x) ? !this.map.get(x).has(y) : true;
        }
      }
    }
    return false;
  }
  fillNeighbours = (x, y, z, t: Tile) => {
    let tile;
    if ((tile = this.getTileAt(x - 1, y, z))) {
      t.setNext('east',tile);
      tile.setNext('west', t);
    }
    if ((tile = this.getTileAt(x + 1, y, z))) {
      t.setNext('west',tile);
      tile.setNext('east', t);
    }
    if ((tile = this.getTileAt(x, y - 1, z))) {
      t.setNext('north',tile);
      tile.setNext('south', t);
    }
    if ((tile = this.getTileAt(x, y + 1, z))) {
      t.setNext('south',tile);
      tile.setNext('north', t);
    }
    if ((tile = this.getTileAt(x, y, z - 1))) {
      t.setNext('up',tile);
      tile.setNext('down', t);
    }
    if ((tile = this.getTileAt(x, y, z + 1))) {
      t.setNext('down',tile);
      tile.setNext('up', t);
    }
  }
  forEachTile = (eachFunc) => {
    for (let x of this.map.keys()) {
      for (let y of this.map.get(x).keys()) {
        for (let z of this.map.get(x).get(y).keys()) eachFunc(this.map.get(x).get(y).get(z), x, y, z);
      }
    }
  }

  move(accX, accY, accZ) {
    this.forEachTile((tile) => {
      tile.sprite.isoX += accX;
      tile.sprite.isoY += accY;
      tile.sprite.isoZ += accZ;
    });
  }
}