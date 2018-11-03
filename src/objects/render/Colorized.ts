import { currentScene } from "../../scenes/GameScene";
import Cube from 'phaser3-plugin-isometric/src/Cube';
import IsoColor from "./IsoColor";

export default class Colorized {
    projectionText: string;

    static downloadCube(projection, color: IsoColor) {
        const projectionText = projection[1];
        currentScene.iso.projector.projectionAngle = projection[0];
        const factor = 0.5;

        // draw 1 cube
        const cube = new Cube(0, 0, 0, window.innerWidth * factor, window.innerWidth * factor, window.innerWidth * factor);
        const sides = { lighter: [1, 3, 7, 5], medium: [3, 7, 6, 2], darker: [5, 7, 6, 4] };
        const corners = cube.getCorners();
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const graph = canvas.getContext('2d');
        for (let hue in sides) {
            graph!.fillStyle = color[hue];
            const path = sides[hue];
            let pt = currentScene.iso.projector.project(corners[path[0]]);
            graph!.beginPath();
            graph!.moveTo(pt.x, pt.y);
            for (let i = 1; i < path.length; i++) {
                pt = currentScene.iso.projector.project(corners[path[i]]);
                graph!.lineTo(pt.x, pt.y);
            }
            graph!.fill();
            graph!.closePath();
        }
        // document.body.appendChild(canvas);
        const a = document.createElement("a");
        // document.body.appendChild(a);
        // a.setAttribute('style', "display: none");
        const img = new Image();
        img.src = canvas.toDataURL();
        a.href = img.src;
        a.download = projectionText + '.png';
        a.click();
    }


    static downloadElongatedCube(projection, width, sizeZ, color: IsoColor) {
        const projectionText = projection[1];
        currentScene.iso.projector.projectionAngle = projection[0];
        const factor = 0.5;

        // draw 1 cube
        const cube = new Cube(0, 0, 0, window.innerWidth * factor * width, window.innerWidth * factor * width, window.innerWidth * factor * sizeZ);
        const sides = { lighter: [1, 3, 7, 5], medium: [3, 7, 6, 2], darker: [5, 7, 6, 4] };
        const corners = cube.getCorners();
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const graph = canvas.getContext('2d');
        for (let hue in sides) {
            graph!.fillStyle = color[hue];
            const path = sides[hue];
            let pt = currentScene.iso.projector.project(corners[path[0]]);
            graph!.beginPath();
            graph!.moveTo(pt.x, pt.y);
            for (let i = 1; i < path.length; i++) {
                pt = currentScene.iso.projector.project(corners[path[i]]);
                graph!.lineTo(pt.x, pt.y);
            }
            graph!.fill();
            graph!.closePath();
        }
        document.body.appendChild(canvas);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute('style', "display: none");
        const img = new Image();
        img.src = canvas.toDataURL();
        a.href = img.src;
        a.download = projectionText + '_Elongated _w' + width + '_Z' + sizeZ + '.png';
        a.click();
    }
}
