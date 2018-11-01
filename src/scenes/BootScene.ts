import 'phaser'
import { SCENE_BOOT, SCENE_LOAD } from '../constants/Constants'

export default class BootScene extends Phaser.Scene {
  constructor () {
    super(SCENE_BOOT)
  }

  preload = () => {
    this.load.json('assets', 'json/assets.json')
  }

  create = () => {
    this.scene.start(SCENE_LOAD.key)
  }
}
