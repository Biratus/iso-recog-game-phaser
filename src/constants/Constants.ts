import BootScene from "../scenes/BootScene"
import LoadScene from "../scenes/LoadScene"
import MenuScene from "../scenes/MenuScene"
import GameScene from "../scenes/GameScene"
import TutorialScene from "../scenes/TutorialScene"

export const SCENE_BOOT = { key: 'boot' }
export const SCENE_GAME = {
    key: 'game',
    mapAdd: { isoPlugin: 'iso', isoPhysics: 'isoPhysics' }
}
export const SCENE_TUTORIAL = {
    key: 'tutorial',
    mapAdd: { isoPlugin: 'iso', isoPhysics: 'isoPhysics' }
}
export const SCENE_LOAD = { key: 'load' }
export const SCENE_MENU = { key: 'menu' }

export const GAME_CONFIG = {
    scale: 1,
    tile_size: 64,
    tile_height: 63,
    entryScale: 0.4,
    roomScale: 1.2,
    playerScale: 0.1,
    enemyScale: 0.1,
    // player_scale:0.4
    enablePhysics: false
}

export const gameConfig = {
    type: Phaser.WEBGL,
    parent: 'gameContainer',
    scene: [BootScene, LoadScene, MenuScene,GameScene, TutorialScene]
    // resolution:10
    // physics:{
    //   debug:true
    // }
  }