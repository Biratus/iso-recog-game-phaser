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
            graph!.moveTo(pt.x, pt.y);
            graph!.beginPath();
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
            graph!.moveTo(pt.x, pt.y);
            graph!.beginPath();
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

    static downloadFloatingTiles(projection, tileNb, color,prevCanvas?) {
        const projectionText = projection[1];
        currentScene.iso.projector.projectionAngle = projection[0];
        const factor = 0.5;

        // draw 1 cube
        const cube = new Cube(0, 0, 0, window.innerWidth * factor, window.innerWidth * factor, window.innerWidth * factor);
        const points = [1, 3, 7, 5, 1];
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        const graph = canvas.getContext('2d');
        const cubeW = cube.widthX / tileNb;
        let rnd=[0.07,0.12,0.3,0.57,0.86];
        if(rnd.length!=tileNb) {
            console.error('Wrong probabilities number: is ['+rnd.length+'] but tile number is ['+tileNb+']');
            return;
        }
        rnd = rnd.reverse();
        // console.log('rnd ', rnd);
        let row = 0;
        let cubeTotal=0;
        for (let x = cube.backX; x < cube.frontX; x += cubeW) {
            for (let y = cube.backY; y < cube.frontY; y += cubeW) {
                const c = new Cube(x, y, 0, cubeW, cubeW, 3);
                if (Math.random()*100 > rnd[row]*100) continue;
                cubeTotal++;
                c.bottom = cube.top - 3;

                graph!.fillStyle = color[Math.floor(Math.random()*color.length)];
                const corners = c.getCorners();
                let pt = currentScene.iso.projector.project(corners[points[0]]);
                graph!.beginPath();
                graph!.moveTo(pt.x, pt.y);
                for (let i = 1; i < points.length; i++) {
                    pt = currentScene.iso.projector.project(corners[points[i]]);
                    graph!.lineTo(pt.x, pt.y);
                }
                graph!.closePath();
                graph!.fill();
            }
            row++;
        }

        const a = document.createElement("a");
        document.body.appendChild(a);
        // a.setAttribute('style', "display: none");
        const img = new Image();
        img.src = canvas.toDataURL();
        a.href = img.src;
        a.download = projectionText + '.png';
        a.click();
        
        setTimeout(() => {
            if(prevCanvas) prevCanvas.remove();
            a.remove();
            Colorized.downloadFloatingTiles(projection,tileNb,color,canvas);
        },0.5*1000);
    }
}
