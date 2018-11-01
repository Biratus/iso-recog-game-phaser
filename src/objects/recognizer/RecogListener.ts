import { Point, Recognizer } from 'outlines';
import 'phaser'
import { currentScene } from '../../scenes/GameScene';

export default class RecogListener {
    shapeCount = 0;
    points: Point[] = [];
    emitter: Phaser.Events.EventEmitter;
    recognizer: Recognizer;
    _isDown: boolean

    constructor() {
        this.recognizer = new Recognizer();
        this.emitter = new Phaser.Events.EventEmitter();
        this.emitter.addListener('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this._isDown = true;
            this.addPoint(pointer.x, pointer.y);
        });
        this.emitter.addListener('pointermove', (pointer) => {
            this.addPoint(pointer.x, pointer.y);
        });
        this.emitter.addListener('pointerup', (pointer) => {
            this._isDown = false;
            currentScene.events.emit('shapeDrown', this.getShape());
        });
    }

    addPoint(x, y) {
        if (!this._isDown) return;
        this.points.push(new Point(x, y, this.shapeCount));
    }

    getShape() {
        this.uniformizePoints();
        console.log(this.points);
        currentScene.drawPoints(this.points, 0xff0000, false);
        const shape = this.recognizer.Rank(this.points);

        this.points = [];
        this.shapeCount++;
        return shape;
    }

    uniformizePoints() {
        const safeI = 1000;
        let count = 0;
        let initMax = this.maxDistanceBetweenPoints();
        const minDistance = initMax*0.3;
        const maxDistance = initMax * 0.8;
        let next, current;
        count++;
        let i = 0;
        let removals=0;
        let addings=0;
        while (i < this.points.length - 1) {
            if (this.points.length >= 100) return;
            current = this.points[i];
            next = this.points[i + 1];
            let d = Phaser.Math.Distance.Between(current.X, current.Y, next.X, next.Y);
            if (d <= minDistance) {
                removals++;
                if(i+1==this.points.length-1) {
                    this.points.splice(i,1);
                    break;
                }
                this.points.splice(i + 1, 1);
                continue;
            }
            i++;
        }
    
        let hasDoneSmth=true;
        while (hasDoneSmth && count <= safeI) {
            let next, current;
            count++;
            let i = 0;
            hasDoneSmth=false;
            while (i < this.points.length - 1) {
                if (this.points.length >= 100) return;
                current = this.points[i];
                next = this.points[i + 1];
                let d = Phaser.Math.Distance.Between(current.X, current.Y, next.X, next.Y);
                if (d <= minDistance) {
                    hasDoneSmth=true;
                    if(i+1==this.points.length-1) {
                        this.points.splice(i,1);
                        break;
                    }
                    this.points.splice(i + 1, 1);
                    continue;
                }
                else if (d > maxDistance) {
                    hasDoneSmth=true;
                    let p = new Point((current.X + next.X) / 2, (current.Y + next.Y) / 2, this.shapeCount);
                    let restPile = this.points.splice(i + 1, this.points.length);
                    this.points.push(p);
                    this.points = this.points.concat(restPile);
                }
                i++;
            }
        }
        if(count>=safeI) console.error("Exit because looped more than "+safeI);
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

}