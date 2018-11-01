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
    add: (l1, l2) => ({ x: l1.x + l2.x, y: l1.y + l2.y, z: (l1.z || 0) + (l2.z || 0) }),
    isOrigin: (loc) => loc.x === 0 && loc.y === 0 && loc.z === 0
});
