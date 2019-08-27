import { renderer } from "../objects/render/Renderer";

export const LOCATION = Object.freeze({
    TOP: { x: 0, y: -1 },
    BOTTOM: { x: 0, y: 1 },
    RIGHT: { x: 1, y: 0 },
    LEFT: { x: -1, y: 0 },
    enum: (): string[] => ['TOP', 'BOTTOM', 'RIGHT', 'LEFT'],
    parse: (str) => {
        for (let val of LOCATION.enum()) {
            if (str == val) return LOCATION[val];
        }
    },
    name: (loc: { x: number, y: number }): string | undefined => {
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
    MEDIUM = 'med'
};

export const ENEMY_SPAWN_EVENT = Object.freeze({
    PREVIOUS_DIE: {
        name: 'prevDie',
        run: (enemy, enMana) => {
            // let c = renderer.getCenterXYOfRoom(enMana.entry.source);
            enemy.goToGoal(0, 0, (en) => enMana.killInstant(en, true))
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


Math.lineIntersection = function (l1, l2) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    let line1StartX = l1.v1.x, line1StartY = l1.v1.y, line1EndX = l1.v2.x, line1EndY = l1.v2.y,
        line2StartX = l2.v1.x, line2StartY = l2.v1.y, line2EndX = l2.v2.x, line2EndY = l2.v2.y
    let denominator, a, b, numerator1, numerator2, result = {
        x: 0,
        y: 0,
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

Math.getCentroidPosition = function (pts) {
    let first = pts[0], last = pts[pts.length - 1];
    if (first.x != last.x || first.y != last.y) pts.push(first);
    let twicearea = 0,
        x = 0, y = 0,
        nPts = pts.length,
        p1, p2, f;
    for (let i = 0, j = nPts - 1; i < nPts; j = i++) {
        p1 = pts[i]; p2 = pts[j];
        f = p1.x * p2.y - p2.x * p1.y;
        twicearea += f;
        x += (p1.x + p2.x) * f;
        y += (p1.y + p2.y) * f;
    }
    f = twicearea * 3;
    return { x: x / f, y: y / f };
}

Math.angleBetweenPoints = function (cx, cy, ex, ey, rad) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    if (rad) theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

Math.dist = function (x1, y1, x2, y2) {
    if (!x2) x2 = 0;
    if (!y2) y2 = 0;
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}