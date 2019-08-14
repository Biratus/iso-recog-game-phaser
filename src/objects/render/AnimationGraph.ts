import { RenderUtils } from "../utils/RenderUtils";
import { GAME_CONFIG } from "../../constants/Constants";
import { renderer } from "./Renderer";
import { currentScene } from "../../scenes/TutorialScene";
import { GameModule } from "../utils/GameUtils";

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
        for (let i in this.particles) this.particles[i].killAll();
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
                this.particles.fadeOutShape = this.particles.fadeOutShape || currentScene.add.particles('blue').createEmitter({
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

        // this.mainGraphics.clear();
        // clearInterval(this.intervals.shape);
        // let shapeCenter = RenderUtils.getCentroidOfPoints(points);
        // let opac = 1;
        // this.intervals.shape = setInterval(() => {
        //     if (opac <= 0) {
        //         this.mainGraphics.clear();
        //         clearInterval(this.intervals.shape);
        //         return;
        //     }

        //     points.forEach(p => {
        //         p.dist += p.originDist * 0.01;
        //         p.x = shapeCenter.x + p.cos * p.dist;
        //         p.y = shapeCenter.y + p.sin * p.dist;
        //     });

        //     this.mainGraphics.clear();
        //     opac -= 1 / 10;
        //     opac = parseFloat(opac.toFixed(1));
        //     this.mainGraphics.fillStyle(0xff0000, opac);
        //     points.forEach(p => this.mainGraphics.fillCircle(p.x, p.y, 3));
        // }, 50);
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
        this.lightSource = currentScene.make.sprite({
            x: sprite.isoBounds.centerX,
            y: sprite.y - sprite.height * 0.75,
            key: 'mask1',
            add: false
        }).setScale(0.5);
        this.lightSource.scale = GAME_CONFIG.scale;
        let mask = new Phaser.Display.Masks.BitmapMask(currentScene, this.lightSource);
        renderer.spritesContainer.setMask(mask);
        this.lightSource.alpha = 0.8;
        this.lightSource.x = sprite.x;
        this.lightSource.y = sprite.y;
        this.lightSourceTween = currentScene.tweens.add({
            targets: this.lightSource,
            alpha: 0.5,
            scale: 0.8,
            duration: 2000,
            ease: 'Sine.easeInOut',
            loop: -1,
            yoyo: true
        });
        this.emitter.on(endEvent, () => {
            renderer.spritesContainer.clearMask();
            this.lightSource.destroy();
            this.lightSourceTween.stop();
        });
    }

    animateFadeDownCircle(x, startY, endY, color, size, duration, repeat, stopEvent) {

        let g = this.graphics.fadeDownCircle || currentScene.add.graphics({
            x: 0, y: 0,
            lineStyle: { color: color, width: 5 },
            fillStyle: { color: 0xffffff, alpha: 0.1 }
        });

        g.clear();
        let lineLength = endY - startY;
        let startTime = new Date().getTime();
        let a = 1;
        this.updates.fadeDownCircle = (time, delta) => {
            let now = new Date().getTime();
            if ((now - startTime) > duration) {
                /*let diff = now - (duration + startTime);
                if (diff < duration * 0.3) {
                    a -= 0.1;
                    g.lineStyle(5, color, a);
                    g.lineBetween(x, startY, x, endY);
                    console.log('alpha')
                } else {*/
                delete this.updates.fadeDownCircle;

                this.intervals.fadeDownCircle = setTimeout(() => {
                    this.animateFadeDownCircle(x, startY, endY, color, size, duration, repeat, stopEvent);
                }, 1000);
                // }
            } else {
                g.clear();
                g.lineBetween(x, startY, x, startY + lineLength * (now - startTime) / duration);
            }

        }

        this.emitter.on(stopEvent, () => {
            g.clear();
            g.destroy();
            delete this.updates.fadeDownCircle;
            delete this.graphics.fadeDownCircle;
        });
        this.graphics.fadeDownCircle = g;

        /*for(let i=0;i<3;i++) {
        let img = currentScene.add.image(x, startY, 'mask2');
        img.setScale(size / img.width);
        img.setTint(color);
        debugger;
        if(i>0) img.visible=true;
        currentScene.add.tween({
            targets: img,
            duration: duration,
            props: { alpha: 0, y: endY},
            ease: Phaser.Math.Easing.Sine.In,
            delay: i*100,
            repeat: 999,
            reapeatDelay: 750,
            onUpdate: function (tween) {
                var tint = Phaser.Display.Color.Interpolate.ColorWithColor(
                    Phaser.Display.Color.IntegerToColor(0xffffff),
                    Phaser.Display.Color.IntegerToColor(color),
                    1,
                    tween.getValue()
                );
                img.setTint(Phaser.Display.Color.GetColor(tint.r,tint.g,tint.b));

            },
            onStart: () => { img.visible = true },
            onComplete: () => {
                debugger;

            }
        });
        this.emitter.on(stopEvent, () => {
            debugger;
            img.destroy();
            currentScene.tweens.killTweensOf(img);
        });
        }*/





        /*
        let g = this.graphics.fadeDownCircle || currentScene.add.graphics({
            x: 0, y: 0,
            lineStyle: { color: 0xffffff, width: 10 },
            fillStyle: { color: color, alpha: 0.95 }
        });
        g.fillCircle(x,startY,size);
        debugger;
        currentScene.add.tween({
            targets:g,
            duration:duration,
            props:{alpha:0.1,y:Math.abs(startY-endY),},
            ease: Phaser.Math.Easing.Sine.In,
            delay: 0,
            repeat:999,
            reapeatDelay:750,
            onComplete:() => {
                debugger;
                this.graphics.fadeDownCircle.clear();
            }
        });
        this.emitter.on(stopEvent,() => {
            debugger;
            currentScene.tweens.killTweensOf(this.graphics.fadeDownCircle);
        });

        this.graphics.fadeDownCircle = g;
*/
    }

    getGraph(name, config): Phaser.GameObjects.Graphics {
        this.graphics[name] = this.graphics[name] || currentScene.add.graphics(config);
        return this.graphics[name];
    }
    destroyGraph(name) {
        if (!this.graphics[name]) return;
        this.graphics[name].destroy();
        delete this.graphics[name];
    }
}