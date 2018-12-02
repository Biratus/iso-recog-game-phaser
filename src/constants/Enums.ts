export const LOCATION = Object.freeze({
    TOP: { x: 0, y: -1 },
    BOTTOM: { x: 0, y: 1 },
    RIGHT: { x: 1, y: 0 },
    LEFT: { x: -1, y: 0 },
    parse: (str) => {
        for (let val in LOCATION) {
            if (str == val) return LOCATION[val];
        }
    },
    add: (l1, l2) => ({ x: l1.x + l2.x, y: l1.y + l2.y, z: l1.z ? l2.z : 0 + l2.z ? l2.z : 0 }),
    isOrigin: (loc) => loc.x === 0 && loc.y === 0,
    equals: (l1, l2) => l1.x === l2.x && l1.y === l2.y,
    opposite: (loc) => {
        for (let val in LOCATION) {
            if (LOCATION[val].x === undefined) continue;
            if (LOCATION.equals({ x: 0, y: 0 }, LOCATION.add(loc, LOCATION[val]))) return LOCATION[val];
        }
    },
    multiply: (l, number) => ({ x: l.x * number, y: l.y * number, z: l.z * number }),
});

export const ENTRY_DIFF = Object.freeze({
    LOW: 0,
    parse: (value) => {
        for (let val in ENTRY_DIFF) {
            if (value == val) return ENTRY_DIFF[val];
        }
    }
});

export const ENEMY_TYPE = Object.freeze({
    SMALL: 'sm',
    parse: (value) => {
        for (let val in ENEMY_TYPE) {
            if (value == val) return ENEMY_TYPE[val];
        }
    }
});
