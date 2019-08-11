import { IsoSprite } from 'phaser3-plugin-isometric';
import Entry from '../core/Entry';
import { GameModule } from './GameUtils';

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
    export function pointsInRect(points, rect: { x: number, y: number, w: number, h: number }) {
        let i = 0;
        points = GameModule.normalizePointName(points);
        for (let p of points) {
            i++
            if ((p.x < rect.x || p.x > rect.x + rect.w) || (p.y < rect.y || p.y > rect.y + rect.h)) return false;
        }
        console.log("out at " + i + " / " + points.length);
        return true;
    }
}