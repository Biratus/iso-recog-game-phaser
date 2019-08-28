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

export const ENEMY_CONFIG = {
    scale: 0.2
}

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

export const DEFAULT_ROOM_CONFIG = {
    key: "abstractTile_01",
    // block_size: 17// /!\ IMPAIR /!\
    block_size: 13// /!\ IMPAIR /!\
}