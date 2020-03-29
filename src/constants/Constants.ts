import BootScene from "../scenes/BootScene"
import LoadScene from "../scenes/LoadScene"
import MenuScene from "../scenes/MenuScene"
import GameScene from "../scenes/GameScene"
import TutorialScene from "../scenes/TutorialScene"
import TestScene from "../scenes/TestScene"

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
export const SCENE_TEST = {
    key: 'test',
    mapAdd: { isoPlugin: 'iso', isoPhysics: 'isoPhysics' }
}

export const RENDER_VAR = {
    orig: [308.15, 228.216],
    entry: [468.077, 145.553],
    origW: 519,
    origH: 507.595
}

export const GAME_CONFIG = {
    scale: 1,
    tile_size: 64,
    tile_height: 63,
    entryScale: 0.4,
    entryScaleToRoom: 0.2,
    // roomScale: 0.65,
    roomRatio: 0.9,
    playerRatio: 0.025,
    // playerScale: 0.08,
    enemyScale: 0.08,
    // player_scale:0.4
    enablePhysics: false,
    recog_threshold: 0.93
}

export const DURATIONS = {
    tutorial: {
        light:1500,
        tap2d:400,
        tap3d:300,
        playerWalk:1700
    },
    scene: {
        fadeIn:1000,
        fadeOut:1000,
        menu:750
    },
    player: {
        crossRoom:1700,
        backlash:30
    },
    room: {
        transition:2400,
        fadeOutTransition:1700
    }
}

export const gameConfig = {
    type: Phaser.WEBGL,
    parent: 'gameContainer',
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [BootScene, LoadScene, MenuScene, GameScene, TutorialScene, TestScene]
    // resolution:10
    // physics:{
    //   debug:true
    // }
}