import { Point, Recognizer } from 'outlines';
import 'phaser'
import { currentScene } from '../../scenes/GameScene';
import { Timeout } from '../utils/Timeout';
import { RenderUtils } from '../utils/RenderUtils';
import ArrayUtils from '../utils/ArrayUtils';

export default class RecogListener {
    shapeCount = 0;
    points: Point[] = [];
    emitter: Phaser.Events.EventEmitter;
    recognizer: Recognizer;
    _isDown: boolean;
    enabled: boolean;

    shapeDrownTimeout: number;
    opac:number;
    shapeCenter:Point;

    constructor() {
        this.recognizer = new Recognizer();
        this.emitter = new Phaser.Events.EventEmitter();
        this.emitter.addListener('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.enabled) return;
            this._isDown = true;
            this.points=[];
            clearInterval(this.shapeDrownTimeout);
            currentScene.graphics.clear();
            currentScene.graphics.clearAlpha();
            currentScene.graphics.fillCircle(pointer.x, pointer.y, 3);
            this.addPoint(pointer.x, pointer.y);
        });
        this.emitter.addListener('pointermove', (pointer) => {
            if (!this.enabled) return;
            currentScene.graphics.fillCircle(pointer.x, pointer.y, 3);
            this.addPoint(pointer.x, pointer.y);
        });
        this.emitter.addListener('pointerup', (pointer) => {
            if (!this.enabled) return;
            this._isDown = false;
            let shape = this.getShape();
            this.fadeOutShape();
            currentScene.events.emit('shapeDrown', shape);
        });
    }

    addPoint(x, y) {
        if (!this._isDown) return;
        this.points.push(new Point(x, y, this.shapeCount));
    }

    getShape() {
        this.uniformizePoints();
        if (this.points.length < 10) return [];
        const shape = this.recognizer.Rank(this.points);

        this.shapeCount++;
        return shape;
    }

    uniformizePoints() {
        const safeI = 1000;
        let count = 0;
        let initMax = this.maxDistanceBetweenPoints();
        const minDistance = initMax * 0.3;
        const maxDistance = initMax * 0.8;
        let next, current;
        count++;
        let i = 0;
        while (i < this.points.length - 1) {
            if (this.points.length >= 100) return;
            current = this.points[i];
            next = this.points[i + 1];
            let d = Phaser.Math.Distance.Between(current.X, current.Y, next.X, next.Y);
            if (d <= minDistance) {
                if (i + 1 == this.points.length - 1) {
                    this.points.splice(i, 1);
                    break;
                }
                this.points.splice(i + 1, 1);
                continue;
            }
            i++;
        }

        let hasDoneSmth = true;
        while (hasDoneSmth && count <= safeI) {
            let next, current;
            count++;
            let i = 0;
            hasDoneSmth = false;
            while (i < this.points.length - 1) {
                if (this.points.length >= 100) return;
                current = this.points[i];
                next = this.points[i + 1];
                let d = Phaser.Math.Distance.Between(current.X, current.Y, next.X, next.Y);
                if (d <= minDistance) {
                    hasDoneSmth = true;
                    if (i + 1 == this.points.length - 1) {
                        this.points.splice(i, 1);
                        break;
                    }
                    this.points.splice(i + 1, 1);
                    continue;
                }
                else if (d > maxDistance) {
                    hasDoneSmth = true;
                    let p = new Point((current.X + next.X) / 2, (current.Y + next.Y) / 2, this.shapeCount);
                    let restPile = this.points.splice(i + 1, this.points.length);
                    this.points.push(p);
                    this.points = this.points.concat(restPile);
                }
                i++;
            }
        }
        if (count >= safeI) console.error("Exit because looped more than " + safeI);
    }
    avgDistanceBetweenPoints(): number {
        return this.totalDistanceBetweenPoints() / this.points.length;
    }

    totalDistanceBetweenPoints(): number {
        let acc = 0.0;
        let current, next;
        for (let i = 0; i < this.points.length - 1; i++) {
            current = this.points[i];
            next = this.points[i + 1];
            acc += Phaser.Math.Distance.Between(current.X, current.Y, next.X, next.Y);
        }
        return acc;
    }

    maxDistanceBetweenPoints(): number {
        let max = 0;
        let current, next;
        for (let i = 0; i < this.points.length - 1; i++) {
            current = this.points[i];
            next = this.points[i + 1];
            let d = Phaser.Math.Distance.Between(current.X, current.Y, next.X, next.Y);
            if (max < d) max = d;
        }
        return max;
    }
    minDistanceBetweenPoints(): number {
        let min = Phaser.Math.Distance.Between(0, 0, currentScene.game.canvas.width, currentScene.game.canvas.height);
        let current, next;
        for (let i = 0; i < this.points.length - 1; i++) {
            current = this.points[i];
            next = this.points[i + 1];
            let d = Phaser.Math.Distance.Between(current.X, current.Y, next.X, next.Y);
            if (min > d) min = d;
        }
        return min;
    }

    enable() { this.enabled = true; }
    disable() { this.enabled = false; }

    fadeOutShape() {
        let axisNb = 3;
        let axis: any = [];
        let loops = 0;
        this.points.forEach(p => {p.x=p.X,p.y=p.Y;});
        for (let i = 0; i < axisNb; i++) {
            let flatMap = axis.flatMap(a => [a.v1, a.v2]);
            let maxDist = ArrayUtils.of(axis).maxValue((a) => Math.dist(a.v1.x, a.v1.y, a.v2.x, a.v2.y));
            let pos;
            let turns = 0;
            do {
                turns++;
                pos = this.points[Math.floor(Math.random() * this.points.length)];
                if (turns > 1000) break;
            } while (RenderUtils.posAreNear(pos, flatMap, maxDist));
            let max = ArrayUtils.of(this.points).max((p) => Math.dist(pos.x, pos.y, p.x, p.y));
            if (!max) continue;
            if (RenderUtils.posAreNear(max, flatMap, maxDist)) {
                loops++;
                if (loops > 1000) break;
                i--; continue;
            }
            axis.push({ v1: pos, v2: max });
        }

        let pts:Point[]= [];
        for (let i = 0; i < axis.length; i++) {
            for (let j = i + 1; j < axis.length; j++) {
                pts.push(Math.lineIntersection(axis[i], axis[j]));
            }
        }
        if (pts.length == 0) {
            console.log('no interset');
            return;
        }

        this.shapeCenter = Math.getCentroidPosition(pts);

        for (let p of this.points) {
            p.originDist = Math.dist(this.shapeCenter.x, this.shapeCenter.y, p.x, p.y);
            p.dist = Math.dist(this.shapeCenter.x, this.shapeCenter.y, p.x, p.y);
            let a = Math.angleBetweenPoints(this.shapeCenter.x, this.shapeCenter.y, p.x, p.y);
            p.cos = Math.cos(a);
            p.sin = Math.sin(a);
        }
        this.opac=1;
        this.shapeDrownTimeout = setInterval(() => {
            if (this.opac <= 0) {
                currentScene.graphics.clear();
                clearInterval(this.shapeDrownTimeout);
                return;
            }

            this.points.forEach(p => {
                p.dist += p.originDist * 0.01;
                p.x = this.shapeCenter.x + p.cos * p.dist;
                p.y = this.shapeCenter.y + p.sin * p.dist;
            });
            
            currentScene.graphics.clear();
            this.opac-=1/10;
            this.opac=parseFloat(this.opac.toFixed(1));
            currentScene.graphics.fillStyle(0xff0000,this.opac);           
            this.points.forEach(p =>  currentScene.graphics.fillCircle(p.x, p.y, 3));
        }, 50);
    }
        
}