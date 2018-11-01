export const SCENE_BOOT = { key: 'boot' }
export const SCENE_GAME = {
    key: 'game',
    mapAdd: { isoPlugin: 'iso', isoPhysics: 'isoPhysics' }
}
export const SCENE_LOAD = { key: 'load' }

export const TILE_WIDTH = 50;
export const TILE_CONFIG = {
    wanted_TW: 50,
    wanted_SH: 38.5,
    default: {
        height: 160, width: 150,
        top_width: 90,
        side_height: 69
    },
    rock_brown_fresh_herb_light: {
        height: 164,
        top_width: 85.5,

    }
}

export const ENEMY_CONFIG = {
    scale:0.4
}

export const GAME_CONFIG = {
    tile_size: 64,
    tile_height: 63,
    scale: 0.5,
    // scale: 0.22,
    // player_scale:0.4
}

export const DEFAULT_ROOM_CONFIG = {
    key: "abstractTile_01",
    // block_size: 21// /!\ IMPAIR /!\
    block_size: 5// /!\ IMPAIR /!\
}
