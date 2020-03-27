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

export const RENDER_VAR = {
    orig: [308.15,228.216],
    entry: [468.077,145.553],
    origW:519,
    origH:507.595
}

export const GAME_CONFIG = {
    scale: 1,
    tile_size: 64,
    tile_height: 63,
    entryScale: 0.4,
    entryScaleToRoom: 0.63,
    roomScale: 0.65,
    playerScale: 0.08,
    enemyScale: 0.08,
    // player_scale:0.4
    enablePhysics: false,
    recog_threshold:0.93
}

export const gameConfig = {
    type: Phaser.WEBGL,
    parent: 'gameContainer',
    width:window.innerWidth,
    height:window.innerHeight,
    scene: [BootScene, LoadScene, MenuScene,GameScene, TutorialScene]
    // resolution:10
    // physics:{
    //   debug:true
    // }
  }