import BootScene from '../scenes/BootScene'
import GameScene from '../scenes/GameScene'
import LoadScene from '../scenes/LoadScene'
import 'phaser'

export const gameConfig = {
  type: Phaser.WEBGL,
  parent: 'gameContainer',
  scene: [BootScene, LoadScene,GameScene],
  physics:{
    debug:true
  }
}
