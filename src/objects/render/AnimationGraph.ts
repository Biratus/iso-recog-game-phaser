import { GAME_CONFIG } from "../../constants/Constants";
import { GameModule } from "../utils/GameUtils";
import { renderer } from "./Renderer";
import { RenderUtils } from "../utils/RenderUtils";
import { Point3 } from 'phaser3-plugin-isometric';

export default class AnimationGraph {
    intervals: any = {};
    lightSource: Phaser.GameObjects.Sprite;
    lightSourceTween: Phaser.Tweens.Tween;

    graphics: { [key: string]: Phaser.GameObjects.Graphics } = {};
    updates: { [key: string]: Function } = {};
    particles: { [key: string]: Phaser.GameObjects.Particles.ParticleEmitter } = {};
    emitter = new Phaser.Events.EventEmitter();

    constructor(private mainGraphics: Phaser.GameObjects.Graphics) {
    }

    deleteAll() {
        this.mainGraphics.destroy();
        if (this.lightSourceTween) this.lightSourceTween.stop();
        if (this.lightSource) this.lightSource.destroy();
        for (let i in this.graphics) this.graphics[i].destroy();
        for (let i in this.particles) this.emitter.emit(i);
    }

    update(time, delta) {
        for (let i in this.updates) this.updates[i](time, delta);
    }

    fadeOutShape(shape, points) {
        if (!shape) return;
        points = GameModule.normalizePointName(points);
        switch (shape.toUpperCase()) {
            case 'SQUARE':
                let shapeCenter = RenderUtils.getCentroidOfPoints(points);
                let sortX = points.sort((p1, p2) => p1.x - p2.x);
                let size = sortX[sortX.length - 1].x - sortX[0].x
                let square = new Phaser.Geom.Rectangle(0, 0, size, size);
                this.particles.fadeOutShape = this.particles.fadeOutShape || GameModule.currentScene.add.particles('blue').createEmitter({
                    x: 0,
                    y: 0,
                    blendMode: 'SCREEN',
                    scale: { start: 0.2, end: 0 },
                    speed: { min: -30, max: 30 },
                    quantity: 50
                });
                this.particles.fadeOutShape.stop();
                this.particles.fadeOutShape.setEmitZone({ source: square, type: 'edge', quantity: 50 });
                this.particles.fadeOutShape.explode(50, shapeCenter!.x - size / 2, shapeCenter!.y - size / 2);
                break;
        }
    }

    fadeOutPoints(points, texture, speed, onFinishCallback?) {
        let p = GameModule.currentScene.add.particles(texture);
        let emit = p.createEmitter({
            scale: 0.1,
            speed: { min: -1 * speed, max: speed },
            alpha: { start: 1, end: 0 },
            blendMode: 'SCREEN',
            on: false
        });
        emit.onParticleDeath(() => {
            if (emit.getAliveParticleCount() <= 0) {
                if (onFinishCallback) onFinishCallback();
                p.destroy();
                emit.stop();
            }
        });
        GameModule.normalizePointName(points).forEach((pt) => p.emitParticleAt(pt.x, pt.y));
    }

    drawDashedHollowRect(config: { x: number, y: number, w: number, h: number, holeW: number, holeH: number, rectColor: number, rectAlpha: number, dashSize: number, dashGap: number, strokeColor: number, strokeAlpha: number }) {
        this.drawHollowRect(config.x, config.y, config.w, config.h, config.holeW, config.holeH, config.rectColor, config.rectAlpha);

        let factX = (config.w - config.holeW) / 2;
        let factY = (config.h - config.holeH) / 2;

        this.dashedRect(config.x, config.y, config.w, config.h, config.dashSize, config.dashGap, config.strokeColor, config.strokeAlpha, 0x000000, 0);
        this.dashedRect(config.x + factX, config.y + factY, config.w - 2 * factX, config.h - 2 * factY, config.dashSize, config.dashGap, config.strokeColor, config.strokeAlpha, 0x000000, 0);
    }

    drawHollowRect(x, y, w, h, holeW, holeH, fillColor, alpha?) {
        this.mainGraphics.fillStyle(fillColor, alpha);

        let factX = (w - holeW) / 2;
        let factY = (h - holeH) / 2;

        this.rect(x, y, factX, h);
        this.rect(x + w - factX, y, factX, h);
        this.rect(x + factX, y, holeW, factY);
        this.rect(x + factX, y + h - factY, holeW, factY);
    }

    dashedRect(x, y, w, h, dashSize, dashGap, strokeColor, strokeAlpha, fillColor, fillAlpha) {
        this.mainGraphics.lineStyle(3, strokeColor, strokeAlpha);
        this.dashHorizontal(x, x + w, y, dashSize, dashGap);
        this.dashVertical(y, y + h, x, dashSize, dashGap);
        this.dashVertical(y + h, y, x + w, dashSize, dashGap);
        this.dashHorizontal(x, x + w, y + h, dashSize, dashGap);
        this.mainGraphics.fillStyle(fillColor, fillAlpha);
        this.rect(x, y, w, h);
    }

    rect(x, y, w, h) {
        this.mainGraphics.fillRect(x, y, w, h);
    }
    clearMain() {
        this.mainGraphics.clear();
    }

    line(x, y, x1, y1) {
        this.mainGraphics.strokeLineShape(new Phaser.Geom.Line(x, y, x1, y1));
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
        renderer.spritesContainer.clearMask();
        if (this.lightSource) this.lightSource.destroy();
        if (this.lightSourceTween) this.lightSourceTween.stop();

        this.lightSource = GameModule.currentScene.make.sprite({
            x: sprite.x,
            y: sprite.y,
            angle:90,
            alpha:0.8,
            key: 'mask1',
            add: false
        });
        
        this.lightSource.scale = GAME_CONFIG.scale;
        this.lightSourceTween = GameModule.currentScene.tweens.add({
            targets: this.lightSource,
            alpha: 0.5,
            scale: 0.8,
            duration: 1500,
            ease: 'Sine.easeInOut',
            loop: -1,
            yoyo: true
        });
        this.emitter.on(endEvent, () => {
            console.log("lol");
            this.lightSourceTween.stop();
            renderer.spritesContainer.clearMask();
            this.lightSource.destroy();
            // this.lightSourceTween.stop();
            // this.lightSource.alpha=1;
            // this.lightSourceTween = GameModule.currentScene.tweens.add({
            //     targets: this.lightSource,
            //     scale: 30,
            //     alpha:1,
            //     duration: 1700,
            //     ease: 'Sine.easeInOut',
            //     onComplete: () => {
            //         renderer.spritesContainer.clearMask();
            //         this.lightSource.destroy();
            //     }
            // });
        });
        renderer.spritesContainer.mask = new Phaser.Display.Masks.BitmapMask(GameModule.currentScene, this.lightSource);
    }

    shapeClue(path, destroyEvt) {
        if (this.particles.hasOwnProperty(destroyEvt)) this.emitter.emit(destroyEvt);

        let p = GameModule.currentScene.add.particles('blue');
        this.particles[destroyEvt] = p.createEmitter({
            scale: { start: 0.35, end: 0 },
            speed: { min: -10, max: 10 },
            blendMode: 'SCREEN',
            lifespan: 1500,
            frequency: 20,
            emitZone: { type: 'edge', source: path, quantity: 30, yoyo: false }
        });
        this.emitter.once(destroyEvt, () => {
            p.destroy();
            if (this.particles[destroyEvt]) this.particles[destroyEvt].stop();
            delete this.particles[destroyEvt];
        });
    }

    getGraph(name, config): Phaser.GameObjects.Graphics {
        this.graphics[name] = this.graphics[name] || GameModule.currentScene.add.graphics(config);
        return this.graphics[name];
    }
    destroyGraph(name) {
        if (!this.graphics[name]) return;
        this.graphics[name].destroy();
        delete this.graphics[name];
    }

    drawCorners(spr) {
        spr.resetIsoBounds();
        this.mainGraphics.setDepth(GameModule.topZIndex());
        let corners = spr.isoBounds.getCorners();
        for (let c of corners) {
            let proj = GameModule.currentScene.iso.projector.project(c);
            this.mainGraphics.fillCircle(proj.x, proj.y, 2);
        }
        this.mainGraphics.fillStyle(0xff0000);
        let p = (<any>Object).assign({}, spr.isoPosition);
        p.z += spr.isoBounds.halfHeight;
        let proj = GameModule.currentScene.iso.projector.project(p);
        this.mainGraphics.fillCircle(proj.x, proj.y, 2);
    }

    drawLine(line) {
        this.mainGraphics.setDepth(GameModule.topZIndex());
        this.mainGraphics.fillStyle(0xff0000);
        for (let i = 0; i < 50; i++) {
            let p = line.getRandomPoint();
            this.mainGraphics.fillCircle(p.x, p.y, 2);
        }
        // this.mainGraphics.lineBetween(line.x1,line.y1,line.x2,line.y2);
    }
}