import { renderer } from "../objects/render/Renderer";

export const LOCATION = Object.freeze({
    TOP: { x: 0, y: -1 },
    BOTTOM: { x: 0, y: 1 },
    RIGHT: { x: 1, y: 0 },
    LEFT: { x: -1, y: 0 },
    enum: () => ['TOP', 'BOTTOM', 'RIGHT', 'LEFT'],
    parse: (str) => {
        for (let val of LOCATION.enum()) {
            if (str == val) return LOCATION[val];
        }
    },
    name: (loc: { x: number, y: number }):string | undefined => {
        for (let l of LOCATION.enum()) {
            if (LOCATION[l].x == loc.x && LOCATION[l].y == loc.y) return l;
        }
        return undefined;
    },
    add: (l1, l2) => ({ x: l1.x + l2.x, y: l1.y + l2.y, z: l1.z ? l2.z : 0 + l2.z ? l2.z : 0 }),
    multLoc: (l1, l2) => ({ x: l1.x * l2.x, y: l1.y * l2.y, z: l1.z ? l2.z : 0 * l2.z ? l2.z : 0 }),
    isOrigin: (loc) => loc.x === 0 && loc.y === 0,
    equals: (l1, l2) => l1.x === l2.x && l1.y === l2.y,
    opposite: (loc) => {
        for (let val of LOCATION.enum()) {
            if (LOCATION.equals({ x: 0, y: 0 }, LOCATION.add(loc, LOCATION[val]))) return LOCATION[val];
        }
    },
    multiply: (l, number) => ({ x: l.x * number, y: l.y * number, z: l.z * number }),
});

export enum ENTRY_DIFF {
    LOW
};

export namespace ENTRY_DIFF {
    export function parse(str): string {
        return ENTRY_DIFF[str];
    }
}

export const enum ENEMY_TYPE {
    SMALL = 'sm',
    MEDIUM = 'sm'
};

export const ENEMY_SPAWN_EVENT = Object.freeze({
    PREVIOUS_DIE: {
        name: 'prevDie',
        run: (enemy, enMana) => {
            // let c = renderer.getCenterXYOfRoom(enMana.entry.source);
            enemy.goToGoal(0,0, (en) => enMana.killInstant(en, true))
        }
    },
    parse: (str) => {
        for (let val in ENEMY_SPAWN_EVENT) {
            if (str == val) return ENEMY_SPAWN_EVENT[val];
        }
    }
});

export const INTERACTION_EVENT = Object.freeze({
    ENTRY_CLICK: 'entry_click'
});
