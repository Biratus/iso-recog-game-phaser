export module Location {
    export var TOP: { x: 0, y: -1 };
    export var BOTTOM: { x: 0, y: 1 };
    export var RIGHT: { x: 1, y: 0 };
    export var LEFT: { x: -1, y: 0 };
    export var ORIGIN: { x: 0, y: 0 };
    export function values(): string[] {
        return ['TOP', 'BOTTOM', 'RIGHT', 'LEFT'];
    }
    export function parse(str): { x: number, y: number } | undefined {
        for (let val of Location.values()) {
            if (str == val) return Location[val];
        }
        return undefined;
    };
    export function name(loc: { x: number, y: number }): string | undefined {
        for (let l of Location.values()) {
            if (Location[l].x == loc.x && Location[l].y == loc.y) return l;
        }
        return undefined;
    };
    export function add(l1: { x: number, y: number, z?: number }, l2: { x: number, y: number, z?: number }) {
        return { x: l1.x + l2.x, y: l1.y + l2.y, z: l1.z ? l2.z : 0 + l2.z! ? l2.z : 0 }
    };
    export function multLoc(l1: { x: number, y: number, z?: number }, l2: { x: number, y: number, z?: number }) {
        return { x: l1.x * l2.x, y: l1.y * l2.y, z: l1.z ? l2.z : 0 * l2.z! ? l2.z : 0 }
    };
    export function isOrigin(loc: { x: number, y: number }) { return loc.x === 0 && loc.y === 0; };
    export function equals(l1: { x: number, y: number }, l2: { x: number, y: number }) { return l1.x === l2.x && l1.y === l2.y; };
    export function signFromCoord(c: { x: number, y: number, z?: number }) {
        return { x: c.x == 0 ? 0 : c.x / Math.abs(c.x), y: c.y == 0 ? 0 : c.y / Math.abs(c.y), z: c.z ? c.z == 0 ? 0 : c.z / Math.abs(c.z) : 0 }
    };
    export function signFromIsoCoord(c: { isoX: number, isoY: number, isoZ: number }) {
        return { x: c.isoX == 0 ? 0 : c.isoX / Math.abs(c.isoX), y: c.isoY == 0 ? 0 : c.isoY / Math.abs(c.isoY), z: c.isoZ ? c.isoZ == 0 ? 0 : c.isoZ / Math.abs(c.isoZ) : 0 }
    };
    export function opposite(loc: { x: number, y: number }) {
        for (let val of Location.values()) {
            if (Location.equals(Location.ORIGIN, Location.add(loc, Location[val]))) return Location[val];
        }
    };
    export function switchXY(c: { x: number, y: number }) { return { x: c.y, y: c.x } };
    export function multiply(l: { x: number, y: number, z?: number }, number: number) { return { x: l.x * number, y: l.y * number, z: l.z! * number } };
}