import { renderer } from "../objects/render/Renderer";

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
    add: (l1, l2) => ({ x: l1.x + l2.x, y: l1.y + l2.y,z:l1.z?l2.z:0+l2.z?l2.z:0}),
    isOrigin: (loc) => loc.x === 0 && loc.y === 0,
    equals:(l1,l2) => l1.x === l2.x && l1.y === l2.y,
    opposite:(loc) => {
        for (let val in LOCATION) {
            if(LOCATION[val].x === undefined) continue;
            if (LOCATION.equals({x:0,y:0},LOCATION.add(loc,LOCATION[val]))) return LOCATION[val];
        }
    } 
});

export enum ENTRY_DIFF{
    LOW
};

export namespace ENTRY_DIFF {
    export function parse(str):string {
        return ENTRY_DIFF[str];
    }
}

export const enum ENEMY_TYPE {
    SMALL='sm',
    MEDIUM='sm'
};

export const ENEMY_SPAWN_EVENT = Object.freeze({
   PREVIOUS_DIE:{
       name:'prevDie',
       run:(enemy,enMana) => {
        let c = renderer.getCenterXYOfRoom(enMana.entry.source);
        enemy.goToGoal(c.x,c.y,(en) => enMana.killInstant(en,true))
       }
   },
   parse: (str) => {
    for (let val in ENEMY_SPAWN_EVENT) {
        if (str == val) return ENEMY_SPAWN_EVENT[val];
    }
}
});
