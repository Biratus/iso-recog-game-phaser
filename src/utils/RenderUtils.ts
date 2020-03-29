import { Point } from 'outlines';
import { IsoSprite, Point3 } from 'phaser3-plugin-isometric';
import ArrayUtils from './ArrayUtils';
import { GameModule } from './GameModule';
import { Location } from '../constants/Location';
import GameScene from '../scenes/GameScene';
import Room from '../objects/core/Room';
import { RENDER_VAR, GAME_CONFIG } from '../constants/Constants';
import { InspectOptions } from 'util';

export module RenderUtils {
    export var roomTexture = "roomFull.roomFull";
    export function spriteIsoHeight(sprite: IsoSprite) { return sprite.displayHeight * 0.5; }
    export function spriteIsoWidth(sprite: IsoSprite) { return Math.sqrt(Math.pow(sprite.displayWidth / 2, 2) + Math.pow(sprite.displayWidth / 4, 2)); }
    export function spriteHalfIsoWidth(sprite: IsoSprite) { return RenderUtils.spriteIsoWidth(sprite) / 2; }
    export function spriteHalfIsoHeight(sprite: IsoSprite) { return RenderUtils.spriteIsoHeight(sprite) / 2; }
    export function topXYFromIsoSprite(sprite: IsoSprite, proj2d = false) {
        let p = (<any>Object).assign({}, sprite.isoPosition);
        p.z += sprite.isoBounds.halfHeight;
        return proj2d ? GameModule.currentScene.iso.projector.project(p) : p;
    }
    export function posAreNear(val, pos, maxDist) {
        if (pos.length == 0) return false;
        for (let p of pos) {
            let d = Math.dist(val.x, val.y, p.x, p.y);
            if (d < maxDist * 0.2) return true;
        }
        return false;

    }

    export function pointInRect(p, rect: { x: number, y: number, w: number, h: number }) {
        return p.x > rect.x && p.x < rect.x + rect.w && p.y > rect.y && p.y < rect.y + rect.h
    }
    export function pointInCircle(p, circle: { x: number, y: number, rad: number }) {
        return Math.dist(circle.x, circle.y, p.x, p.y) < circle.rad;
    }
    export function pointsInRect(points, rect: { x: number, y: number, w: number, h: number }) {
        points = GameModule.normalizePointName(points);
        for (let p of points) {
            if ((p.x < rect.x || p.x > rect.x + rect.w) || (p.y < rect.y || p.y > rect.y + rect.h)) return false;
        }
        return true;
    }

    export function pointsInCircle(points, circle: { x: number, y: number, rad: number }) {
        points = GameModule.normalizePointName(points);
        for (let p of points) {
            if (Math.dist(circle.x, circle.y, p.x, p.y) > circle.rad) return false;
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

    export function getTopFrontLine(spr, proj2d = false): Phaser.Geom.Line {
        let p = (<any>Object).assign({}, spr.isoPosition);
        p.z += spr.isoBounds.halfHeight;

        let opp = Location.opposite(Location.signFromCoord(spr.isoPosition));
        let w = RenderUtils.spriteHalfIsoWidth(spr);
        p.x += opp.x * w;
        p.y += opp.y * w;
        let switched = Location.signFromCoord(Location.switchXY(p));
        let s = { x: p.x + switched.x * w, y: p.y + switched.y * w };
        let e = { x: p.x - switched.x * w, y: p.y - switched.y * w };
        if (proj2d) {
            s = GameModule.gameScene().iso.projector.project(<Point3>{ x: s.x, y: s.y, z: p.z });
            e = GameModule.gameScene().iso.projector.project(<Point3>{ x: e.x, y: e.y, z: p.z });
        }
        return new Phaser.Geom.Line(s.x, s.y, e.x, e.y);
    }

    export function test() {
        console.assert(RenderUtils.pointInRect({ x: 20, y: 20 }, { x: 0, y: 0, w: 50, h: 50 }), 'pointInRect({x:20,y:20},{x:0,y:0,w:50,h:50})');
        console.assert(!RenderUtils.pointInRect({ x: 60, y: 20 }, { x: 0, y: 0, w: 50, h: 50 }), '!pointInRect({x:60,y:20},{x:0,y:0,w:50,h:50} ');
        console.assert(!RenderUtils.pointInRect({ x: 20, y: 60 }, { x: 0, y: 0, w: 50, h: 50 }), '!pointInRect({x:20,y:60},{x:0,y:0,w:50,h:50} ');
        console.assert(!RenderUtils.pointInRect({ x: 60, y: 60 }, { x: 0, y: 0, w: 50, h: 50 }), '!pointInRect({x:60,y:26},{x:0,y:0,w:50,h:50} ');
        console.assert(RenderUtils.pointInCircle({ x: 20, y: 20 }, { x: 0, y: 0, rad: 50 }), ' pointInCircle({x:20,y:20},{x:0,y:0,rad:50})');
        console.assert(!RenderUtils.pointInCircle({ x: 20, y: 20 }, { x: 0, y: 0, rad: 10 }), ' !pointInCircle({x:20,y:20},{x:0,y:0,rad:10})');
        console.assert(!RenderUtils.pointInCircle({ x: 30, y: 20 }, { x: 0, y: 0, rad: 20 }), ' !pointInCircle({x:30,y:20},{x:0,y:0,rad:20})');
        console.assert(!RenderUtils.pointInCircle({ x: 20, y: 30 }, { x: 0, y: 0, rad: 20 }), ' !pointInCircle({x:20,y:30},{x:0,y:0,rad:20})');
    }

    export function textureFrom(room: Room) {
        return RenderUtils.roomTexture + Location.values().filter(l => room._entries[l]).map(l => l.charAt(0)).join('');
    }
    // Depracted
    /*export function distToEntryCenter(sprite: IsoSprite) {
        let gapWSpr = (RENDER_VAR.origW - RENDER_VAR.entry[0]) / sprite.displayWidth;
        let gapHSpr = (RENDER_VAR.origH * 0.5 - RENDER_VAR.entry[1]) / sprite.displayHeight;
        let middleSquare = { x: 0, y: 0, w: sprite.displayWidth - gapWSpr * 2, h: sprite.displayHeight * 0.5 - gapHSpr * 2 }
        if (sprite.originX == 0.5) {
            middleSquare.x = sprite.x;
            middleSquare.y = sprite.y - gapHSpr - middleSquare.h / 2;
        } else {
            middleSquare.x = sprite.x + gapWSpr + middleSquare.w / 2;
            middleSquare.y = sprite.y + gapHSpr + middleSquare.h / 2;
        }
        let e = [middleSquare.x + middleSquare.w / 2, middleSquare.y + middleSquare.h / 2];
        return Math.sqrt(Math.pow(e[0], 2) + Math.pow(-e[1], 2));
    }*/

    export function getEntryCenterFromRoom(sprite: IsoSprite, loc: string): { x: number, y: number, z: number } {
        return Location.multiply(Location[loc], RenderUtils.spriteHalfIsoWidth(sprite) + RenderUtils.spriteHalfIsoWidth(sprite) * GAME_CONFIG.entryScaleToRoom);
    }

    export function getEntryPolygon(sprite:IsoSprite,loc:string,scale:number,inIso = true) {
        let center = RenderUtils.getEntryCenterFromRoom(sprite, loc);
        center.z = 0;
        let w = GAME_CONFIG.entryScaleToRoom * RenderUtils.spriteIsoWidth(sprite) * scale;
        let top=center.y - w;
        let bottom=center.y + w;
        let left=center.x - w;
        let right=center.x + w;
        let ptsShape:any = [
            { x: right, y: bottom, z: 0 },
            { x: right, y: top, z: 0 },
            { x: left, y: top, z: 0 },
            { x: left, y: bottom, z: 0 }
        ];
        if(!inIso) ptsShape = ptsShape.map(pt => GameModule.gameScene().iso.projector.project(<Point3>pt));
            
        return {top,bottom,right,left,points:ptsShape};
    }
}