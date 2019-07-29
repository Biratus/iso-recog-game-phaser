import ArrayUtils from "../utils/ArrayUtils";
import { RenderUtils } from "../utils/RenderUtils";
import { Point } from 'outlines';
import { currentScene } from "../../scenes/GameScene";
import { GAME_CONFIG } from "../../constants/Constants";
import { renderer } from "./Renderer";

export default class AnimationGraph {
    timeouts: any = {};
    lightSource: Phaser.GameObjects.Sprite;
    lightSourceTween: Phaser.Tweens.Tween;

    emmitter = new Phaser.Events.EventEmitter();

    constructor(private graphics: Phaser.GameObjects.Graphics) {
        // this.lightSource = currentScene.make.sprite({
        //     x: 0,
        //     y: 0,
        //     key: 'mask1',
        //     add: false
        // });
    }

    fadeOutShape(points) {
        this.graphics.clear();
        clearInterval(this.timeouts.shape);
        let axisNb = 3;
        let axis: any = [];
        let loops = 0;
        points.forEach(p => { p.x = p.X, p.y = p.Y; });
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

        let shapeCenter = Math.getCentroidPosition(pts);

        for (let p of points) {
            p.originDist = Math.dist(shapeCenter.x, shapeCenter.y, p.x, p.y);
            p.dist = Math.dist(shapeCenter.x, shapeCenter.y, p.x, p.y);
            let a = Math.angleBetweenPoints(shapeCenter.x, shapeCenter.y, p.x, p.y);
            p.cos = Math.cos(a);
            p.sin = Math.sin(a);
        }
        let opac = 1;
        this.timeouts.shape = setInterval(() => {
            if (opac <= 0) {
                this.graphics.clear();
                clearInterval(this.timeouts.shape);
                return;
            }

            points.forEach(p => {
                p.dist += p.originDist * 0.01;
                p.x = shapeCenter.x + p.cos * p.dist;
                p.y = shapeCenter.y + p.sin * p.dist;
            });

            this.graphics.clear();
            opac -= 1 / 10;
            opac = parseFloat(opac.toFixed(1));
            this.graphics.fillStyle(0xff0000, opac);
            points.forEach(p => this.graphics.fillCircle(p.x, p.y, 3));
        }, 50);
    }
    drawDashedHollowRect(config: { x: number, y: number, w: number, h: number, holeW: number, holeH: number, rectColor: number, rectAlpha: number, dashSize: number, dashGap: number, strokeColor: number, strokeAlpha: number }) {
        this.drawHollowRect(config.x, config.y, config.w, config.h, config.holeW, config.holeH, config.rectColor, config.rectAlpha);

        let factX = (config.w - config.holeW) / 2;
        let factY = (config.h - config.holeH) / 2;

        this.dashedRect(config.x, config.y, config.w, config.h, config.dashSize, config.dashGap, config.strokeColor, config.strokeAlpha, 0x000000, 0);
        this.dashedRect(config.x + factX, config.y + factY, config.w - 2 * factX, config.h - 2 * factY, config.dashSize, config.dashGap, config.strokeColor, config.strokeAlpha, 0x000000, 0);
    }
    drawHollowRect(x, y, w, h, holeW, holeH, fillColor, alpha?) {
        this.graphics.fillStyle(fillColor, alpha);

        let factX = (w - holeW) / 2;
        let factY = (h - holeH) / 2;

        this.rect(x, y, factX, h);
        this.rect(x + w - factX, y, factX, h);
        this.rect(x + factX, y, holeW, factY);
        this.rect(x + factX, y + h - factY, holeW, factY);
    }

    dashedRect(x, y, w, h, dashSize, dashGap, strokeColor, strokeAlpha, fillColor, fillAlpha) {
        this.graphics.lineStyle(3, strokeColor, strokeAlpha);
        this.dashHorizontal(x, x + w, y, dashSize, dashGap);
        this.dashVertical(y, y + h, x, dashSize, dashGap);
        this.dashVertical(y + h, y, x + w, dashSize, dashGap);
        this.dashHorizontal(x, x + w, y + h, dashSize, dashGap);
        this.graphics.fillStyle(fillColor, fillAlpha);
        this.rect(x, y, w, h);
    }

    rect(x, y, w, h) {
        this.graphics.fillRect(x, y, w, h);
    }

    line(x, y, x1, y1) {
        this.graphics.strokeLineShape(new Phaser.Geom.Line(x, y, x1, y1));
    }

    dashHorizontal(x1, x2, y, dashSize, dashGap) {
        if (x1 > x2) {
            for (let xi = x2; xi < x1; xi += dashSize) {
                if (xi + dashSize > x1) this.line(xi, y, x1, y);
                else this.line(xi, y, xi + dashSize, y);
                xi += dashGap;
            }
        } else {
            for (let xi = x1; xi < x2; xi += dashSize) {
                if (xi + dashSize > x2) this.line(xi, y, x2, y);
                else this.line(xi, y, xi + dashSize, y);
                xi += dashGap;
            }
        }
    }
    dashVertical(y1, y2, x, dashSize, dashGap) {
        if (y1 > y2) {
            for (let yi = y2; yi < y1; yi += dashSize) {
                if (yi + dashSize > y1) this.line(x, yi, x, y1);
                else this.line(x, yi, x, yi + dashSize);
                yi += dashGap;
            }
        } else {
            for (let yi = y1; yi < y2; yi += dashSize) {
                if (yi + dashSize > y2) this.line(x, yi, x, y2);
                else this.line(x, yi, x, yi + dashSize);
                yi += dashGap;
            }
        }
    }

    focusLight(sprite, endEvent) {
        this.lightSource = currentScene.make.sprite({
            x: sprite.isoBounds.centerX,
            y: sprite.y - sprite.height / 2,
            key: 'mask8'
        }).setScale(0.5);
        this.lightSource.scale = GAME_CONFIG.scale;
        let mask = new Phaser.Display.Masks.BitmapMask(currentScene, this.lightSource);
        renderer.spritesContainer.setMask(mask);
        this.lightSource.x = sprite.x;
        this.lightSource.y = sprite.y;
        this.lightSourceTween = currentScene.tweens.add({
            targets: this.lightSource,
            alpha: 0.8,
            duration: 1000,
            ease: 'Sine.easeInOut',
            loop: -1,
            yoyo: true
        });
        this.emmitter.on(endEvent, () => {
            this.lightSourceTween.stop();
            currentScene.cameras.main.clearMask();
        });
    }

    // clearSquareSpace(x, y, w, h) {
    //     let shape = this.graphics.fillRect(x, y, w, h);
    //     let mask = shape.createGeometryMask();
    //     currentScene.cameras.main.
    // }
}