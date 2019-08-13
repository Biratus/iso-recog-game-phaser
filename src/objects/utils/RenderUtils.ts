import { IsoSprite } from 'phaser3-plugin-isometric';
import { Point } from 'outlines';
import { GameModule } from './GameUtils';
import ArrayUtils from './ArrayUtils';

export module RenderUtils {
    export function spriteIsoHeight(sprite: IsoSprite) { return sprite.displayHeight - sprite.displayWidth / 2; }
    export function spriteIsoWidth(sprite: IsoSprite) { return Math.sqrt(Math.pow(sprite.displayWidth / 2, 2) + Math.pow(sprite.displayWidth / 4, 2)); }
    export function spriteHalfIsoWidth(sprite: IsoSprite) { return RenderUtils.spriteIsoWidth(sprite) / 2; }
    export function spriteHalfIsoHeight(sprite: IsoSprite) { return RenderUtils.spriteIsoHeight(sprite) / 2; }
    export function posAreNear(val, pos, maxDist) {
        if (pos.length == 0) return false;
        for (let p of pos) {
            let d = Math.dist(val.x, val.y, p.x, p.y);
            if (d < maxDist * 0.2) return true;
        }
        return false;

    }

    export function pointInRect(p,rect:{ x: number, y: number, w: number, h: number }) {
        return p.x > rect.x && p.x < rect.x + rect.w && p.y > rect.y && p.y < rect.y + rect.h
    }
    export function pointInCircle(p,circle:{x:number,y:number,rad:number}) {
        return Math.dist(circle.x,circle.y,p.x,p.y)<circle.rad;
    }
    export function pointsInRect(points, rect: { x: number, y: number, w: number, h: number }) {
        points = GameModule.normalizePointName(points);
        for (let p of points) {
            if ((p.x < rect.x || p.x > rect.x + rect.w) || (p.y < rect.y || p.y > rect.y + rect.h)) return false;
        }
        return true;
    }

    export function pointsInCircle(points,circle:{x:number,y:number,rad:number}) {
        points = GameModule.normalizePointName(points);
        for (let p of points) {
            if (Math.dist(circle.x,circle.y,p.x,p.y)>circle.rad) return false;
        }
        return true;

    }

    export function getCentroidOfPoints(points) {
        let axisNb = 3;
        let axis: any = [];
        let loops = 0;
        points = GameModule.normalizePointName(points);
        for (let i = 0; i < axisNb; i++) {
            let flatMap = axis.flatMap(a => [a.v1, a.v2]);
            let maxDist = ArrayUtils.of(axis).maxValue((a) => Math.dist(a.v1.x, a.v1.y, a.v2.x, a.v2.y));
            let pos;
            let turns = 0;
            do {
                turns++;
                pos = points[Math.floor(Math.random() * points.length)];
                if (turns > 1000) break;
            } while (RenderUtils.posAreNear(pos, flatMap, maxDist));
            let max = ArrayUtils.of(points).max((p) => Math.dist(pos.x, pos.y, p.x, p.y));
            if (!max) continue;
            if (RenderUtils.posAreNear(max, flatMap, maxDist)) {
                loops++;
                if (loops > 1000) break;
                i--; continue;
            }
            axis.push({ v1: pos, v2: max });
        }

        let pts: Point[] = [];
        for (let i = 0; i < axis.length; i++) {
            for (let j = i + 1; j < axis.length; j++) {
                pts.push(Math.lineIntersection(axis[i], axis[j]));
            }
        }
        if (pts.length == 0) {
            console.log('no interset');
            return;
        }

        return Math.getCentroidPosition(pts);

    }

    export function test() {
        console.assert(RenderUtils.pointInRect({x:20,y:20},{x:0,y:0,w:50,h:50}),'pointInRect({x:20,y:20},{x:0,y:0,w:50,h:50})');
        console.assert(!RenderUtils.pointInRect({x:60,y:20},{x:0,y:0,w:50,h:50}),'!pointInRect({x:60,y:20},{x:0,y:0,w:50,h:50} ');
        console.assert(!RenderUtils.pointInRect({x:20,y:60},{x:0,y:0,w:50,h:50}),'!pointInRect({x:20,y:60},{x:0,y:0,w:50,h:50} ');
        console.assert(!RenderUtils.pointInRect({x:60,y:60},{x:0,y:0,w:50,h:50}),'!pointInRect({x:60,y:26},{x:0,y:0,w:50,h:50} ');
    }
}