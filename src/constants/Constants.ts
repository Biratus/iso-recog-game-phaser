export const SCENE_BOOT = { key: 'boot' }
export const SCENE_GAME = {
    key: 'game',
    mapAdd: { isoPlugin: 'iso', isoPhysics: 'isoPhysics' }
}
export const SCENE_LOAD = { key: 'load' }

export const ENEMY_CONFIG = {
    scale:0.6
}

export const GAME_CONFIG = {
    tile_size: 64,
    tile_height: 63,
    tile_scale:0.4,
    scale: 0.7,
    // player_scale:0.4
    enablePhysics:false
}

export const DEFAULT_ROOM_CONFIG = {
    key: "abstractTile_01",
    // block_size: 17// /!\ IMPAIR /!\
    block_size: 13// /!\ IMPAIR /!\
}