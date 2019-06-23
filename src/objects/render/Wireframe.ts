import { currentScene } from "../../scenes/GameScene";
import Cube from 'phaser3-plugin-isometric/src/Cube';

export default class Wireframe {

    static downloadCube(projection) {
        let projectionText = projection[1];
        currentScene.iso.projector.projectionAngle = projection[0];
        let factor = 0.5;

        // draw 1 cube
        let cube = new Cube(0, 0, 0, window.innerWidth * factor, window.innerWidth * factor, window.innerWidth * factor);
        let sides = [
            [3, 7, 6, 2, 3, 1, 5, 4, 6], [7, 5]
        ];
        let corners = cube.getCorners();
        let canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let graph = canvas.getContext('2d');
        graph!.strokeStyle = "#000000";
        graph!.lineWidth = 1;
        for (let path of sides) {
            let pt = currentScene.iso.projector.project(corners[path[0]]);
            graph!.moveTo(pt.x, pt.y);
            for (let i = 1; i < path.length; i++) {
                pt = currentScene.iso.projector.project(corners[path[i]]);
                graph!.lineTo(pt.x, pt.y);
            }
            graph!.stroke();
        }
        document.body.appendChild(canvas);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute('style', "display: none");
        let img = new Image();
        img.src = canvas.toDataURL();
        a.href = img.src;
        a.download = projectionText + '.png';
        a.click();
    }

    static downloadPlane(projection) {
        let sides = [
            [3, 7, 6, 2, 3, 1, 5, 4, 6], [7, 5]
        ];
        currentScene.iso.projector.projectionAngle = projection[0];
        let projectionText = projection[1];
        let factor = 0.1;
        let initZ = -3 * window.innerWidth * factor;
        let canvasPlane = document.createElement('canvas');
        canvasPlane.width = window.innerWidth;
        canvasPlane.height = window.innerHeight;
        let graphPlane = canvasPlane.getContext('2d');
        let size = 5;
        let topface = [[1, 3, 7, 5, 1]];
        let topleftface = [[1, 5, 7, 6, 2, 3, 1], [3, 7]];
        let toprightface = [[1, 5, 7, 6, 4, 5, 1], [5, 7]];
        graphPlane!.strokeRect(0, 0, window.innerWidth, window.innerHeight);
        for (let i = -size / 2; i < size; i++) {
            for (let j = -size / 2; j < size; j++) {
                let cube = new Cube(i * window.innerWidth * factor, j * window.innerWidth * factor, initZ, window.innerWidth * factor, window.innerWidth * factor, window.innerWidth * factor);
                let corners = cube.getCorners();
                let toDrawSides = (i < size - 1 && j < size - 1) ? topface : (i == size - 1 ? (j == size - 1 ? sides : toprightface) : topleftface);
                for (let path of toDrawSides) {
                    let pt = currentScene.iso.projector.project(corners[path[0]]);
                    graphPlane!.moveTo(pt.x, pt.y);
                    for (let i = 1; i < path.length; i++) {
                        pt = currentScene.iso.projector.project(corners[path[i]]);
                        graphPlane!.lineTo(pt.x, pt.y);
                    }
                    graphPlane!.stroke();
                }
            }
        }
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute('style', "display: none");
        let img = new Image();
        img.src = canvasPlane.toDataURL();
        a.href = img.src;
        a.download = projectionText + '_plane_lowered_f' + factor + '_size' + size + '.png';
        a.click();
    }

    static downloadElongatedCube(projection, width, sizeZ) {
        let projectionText = projection[1];
        currentScene.iso.projector.projectionAngle = projection[0];
        let factor = 0.5;

        // draw 1 cube
        let cube = new Cube(0, 0, 0, window.innerWidth * factor * width, window.innerWidth * factor * width, window.innerWidth * factor * sizeZ);
        // let sides = [
        //     [3, 7, 6, 2, 3, 1, 5, 4, 6], [7, 5]
        // ];
        let sides = [
            [1,3,7, 5]
        ];
        let corners = cube.getCorners();
        let canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let graph = canvas.getContext('2d');
        graph!.strokeStyle = "#000000";
        graph!.lineWidth = 1;
        for (let path of sides) {
            let pt = currentScene.iso.projector.project(corners[path[0]]);
            graph!.moveTo(pt.x, pt.y);
            for (let i = 1; i < path.length; i++) {
                pt = currentScene.iso.projector.project(corners[path[i]]);
                graph!.lineTo(pt.x, pt.y);
            }
            graph!.stroke();
        }
        document.body.appendChild(canvas);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute('style', "display: none");
        let img = new Image();
        img.src = canvas.toDataURL();
        a.href = img.src;
        a.download = projectionText + '_Elongated _w' + width + '_Z' + sizeZ + '.png';
        a.click();
    }

    static downloadFullCube(projection) {
        let projectionText = projection[1];
        currentScene.iso.projector.projectionAngle = projection[0];
        let factor = 0.5;

        // draw 1 cube
        let cube = new Cube(0, 0, 0, window.innerWidth * factor, window.innerWidth * factor, window.innerWidth * factor);
        let sides = [
            [0, 1, 3, 2, 6, 7, 5, 4, 0, 1, 5], [3, 7], [2, 0], [4, 6]
        ];
        let corners = cube.getCorners();
        let canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let graph = canvas.getContext('2d');
        graph!.strokeStyle = "#000000";
        graph!.lineWidth = 1;
        for (let path of sides) {
            let pt = currentScene.iso.projector.project(corners[path[0]]);
            graph!.moveTo(pt.x, pt.y);
            for (let i = 1; i < path.length; i++) {
                pt = currentScene.iso.projector.project(corners[path[i]]);
                graph!.lineTo(pt.x, pt.y);
            }
            graph!.stroke();
        }
        document.body.appendChild(canvas);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute('style', "display: none");
        let img = new Image();
        img.src = canvas.toDataURL();
        a.href = img.src;
        a.download = projectionText + '_Full.png';
        a.click();
    }
}