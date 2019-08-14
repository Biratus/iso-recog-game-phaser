import { Point, DollarRecognizer } from 'outlines';
import 'phaser';
import TutorialScene, { currentScene } from '../../scenes/TutorialScene';

export default class RecogListener {
    points: Point[] = [];
    emitter: Phaser.Events.EventEmitter;
    recognizer: DollarRecognizer;
    _isDown: boolean;
    enabled: boolean;

    graphics: Phaser.GameObjects.Graphics;

    shapeDrownTimeout: number;
    opac: number;
    shapeCenter: Point;

    constructor(shapeDrownListener: Phaser.Events.EventEmitter) {
        this.recognizer = new DollarRecognizer();
        this.emitter = new Phaser.Events.EventEmitter();
        this.graphics = currentScene.add.graphics({
            x: 0, y: 0,
            lineStyle: { color: 0xffffff, width: 10 },
            fillStyle: { color: 0xffffff, alpha: 1 }
        })
        this.emitter.addListener('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.enabled) return;
            this._isDown = true;
            this.points = [];
            clearInterval(this.shapeDrownTimeout);
            this.graphics.clear();
            this.graphics.clearAlpha();
            this.graphics.fillCircle(pointer.x, pointer.y, 3);
            this.addPoint(pointer.x, pointer.y);
        });
        this.emitter.addListener('pointermove', (pointer) => {
            if (!this.enabled) return;
            this.graphics.fillCircle(pointer.x, pointer.y, 3);
            this.addPoint(pointer.x, pointer.y);
        });
        this.emitter.addListener('pointerup', (pointer) => {
            if (!this.enabled) return;
            this._isDown = false;
            let shape = this.getShape();
            shapeDrownListener.emit('shapeDrown', shape);
            this.graphics.clear();
        });
    }

    addPoint(x, y) {
        if (!this._isDown) return;
        this.points.push(new Point(x, y));
    }

    getShape() {
        // this.uniformizePoints();
        if (this.points.length < 10) return [];
        const shape = this.recognizer.Recognize(this.points, false);

        return shape;
    }

    addUserShape(shapeName) {
        this.recognizer.AddGesture(shapeName.toLowerCase(), this.points);
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
                    let p = new Point((current.X + next.X) / 2, (current.Y + next.Y) / 2);
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
}