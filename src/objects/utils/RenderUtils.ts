import { IsoSprite } from 'phaser3-plugin-isometric';
import Entry from '../core/Entry';

export const RenderUtils = Object.freeze({
    spriteIsoHeight:(sprite:IsoSprite):number => sprite.displayHeight-sprite.displayWidth/2,
    spriteIsoWidth:(sprite:IsoSprite):number =>  Math.sqrt(Math.pow(sprite.displayWidth / 2, 2) + Math.pow(sprite.displayWidth / 4, 2)),
    spriteHalfIsoWidth:(sprite:IsoSprite):number => RenderUtils.spriteIsoWidth(sprite)/2,
    spriteHalfIsoHeight:(sprite:IsoSprite):number => RenderUtils.spriteIsoHeight(sprite)/2,
    posAreNear(val, pos, maxDist) {
        if (pos.length == 0) return false;
        for (let p of pos) {
            let d = Math.dist(val.x, val.y, p.x, p.y);
            if (d < maxDist * 0.2) return true;
        }
        return false;

    }
});