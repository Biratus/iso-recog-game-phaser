import { GameModule } from "../../utils/GameModule";
import { renderer } from "./Renderer";
import GameScene from "../../scenes/GameScene";
import { IsoSprite,Point3 } from 'phaser3-plugin-isometric';
import { RenderUtils } from "../../utils/RenderUtils";


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
        this.mainGraphics.depth = GameModule.topZIndex();
        // let pts = [{x:0,y:0,z:0},{x:0,y:0,z:500}].map(pt => GameModule.gameScene().iso.projector.project(<Point3>pt));
        // this.debugPoints(pts);
        
        // let {x,y} = renderer.getEntryTopLocationAt('TOP',false);
        // this.debugIsoBounds(renderer.currentRoomSprite);
        
        // let bounds = renderer.currentRoomSprite.isoBounds;
        // let p = GameModule.gameScene().iso.projector.project(<Point3>{x:bounds.centerX,y:bounds.centerY,z:bounds.z+bounds.height});
        // this.mainGraphics.fillCircle(p.x,p.y,2);
        // // debugger;
    }

    debugIsoBounds(sprite:IsoSprite) {
        let bounds = sprite.isoBounds;
        let p = GameModule.gameScene().iso.projector.project(<Point3>{x:bounds.x,y:bounds.y,z:bounds.z+bounds.height});
        this.mainGraphics.fillCircle(p.x,p.y,2);
        p = GameModule.gameScene().iso.projector.project(<Point3>{x:bounds.x+bounds.widthX,y:bounds.y,z:bounds.z+bounds.height});
        this.mainGraphics.fillCircle(p.x,p.y,2);
        p = GameModule.gameScene().iso.projector.project(<Point3>{x:bounds.x+bounds.widthX,y:bounds.y+bounds.widthY,z:bounds.z+bounds.height});
        this.mainGraphics.fillCircle(p.x,p.y,2);
        p = GameModule.gameScene().iso.projector.project(<Point3>{x:bounds.x,y:bounds.y+bounds.widthY,z:bounds.z+bounds.height});
        this.mainGraphics.fillCircle(p.x,p.y,2);
        // let w = RenderUtils.spriteIsoWidth(sprite);
        // let h = RenderUtils.spriteIsoHeight(sprite);

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

    debugPoints(pts) {
        let prev,first;
        this.mainGraphics.lineStyle(2,0xff0000,1.0);
        for(let pt of pts) {
            if(prev) {
                this.mainGraphics.lineBetween(prev.x, prev.y, pt.x, pt.y);
            } else first=pt;
            prev=pt;
        }
        this.mainGraphics.lineBetween(prev.x, prev.y, first.x, first.y)
    }
    debugPoint(pt) {
        this.mainGraphics.fillCircle(pt.x,pt.y,5);
    }
    drawPolygon(polygon:Phaser.Geom.Rectangle) {
        this.mainGraphics.lineStyle(2,0xff0000,1.0);
        this.mainGraphics.strokeRectShape(polygon);
    }
}