import 'phaser';
import { DollarRecognizer, Point } from 'outlines';
import { SCENE_TEST } from '../constants/Constants';
import MapUtils from '../objects/utils/MapUtils';
import { GameModule } from '../objects/utils/GameUtils';


export default class TestScene extends Phaser.Scene {
    recognizer;
    constructor() {
        super(SCENE_TEST);
    }

    preload = () => {

        this.load.json('ptsList', 'json/test_points.json');
        this.recognizer = new DollarRecognizer();

        for (let type in GameModule.getUnistrokes()) {
            if (GameModule.getUnistrokes().hasOwnProperty(type))
                GameModule.getUnistrokes()[type].forEach(array => {
                    // let pts = array.map(coord => new Point(coord[0], coord[1]));
                    let pts=array;
                    this.recognizer.AddGesture(type, pts);
                    this.recognizer.AddGesture(type, pts.slice().reverse());
                });
        }
        // if (localStorage.getItem('userShapes')) {
        //     let userShapes = JSON.parse(<string>localStorage.getItem('userShapes'));
        //     for (let type in userShapes) {
        //         if (userShapes.hasOwnProperty(type)) {
        //             userShapes[type].forEach((pts) => {
        //                 this.recognizer.AddGesture(type, pts);
        //                 this.recognizer.AddGesture(type, pts.slice().reverse());
        //             });
        //         }
        //     }
        // }
        this.recognizer.NumUnistrokes = this.recognizer.Unistrokes.length;
    }

    create = () => {
        let ptsList = this.cache.json.get('ptsList');
        let results;
        let allResults={};
        for (let time in ptsList) {
            let { result, list } = this.recognizer.Recognize(ptsList[time].map(pt => new Point(pt.x, pt.y)));
            allResults[time+'']={result,list};
            let ordered = {};
            for (let shape of list) {
                if (ordered.hasOwnProperty(shape.Shape)) ordered[shape.Shape].push(shape.Score);
                else if (MapUtils.of(ordered).length() < 3) {
                    ordered[shape.Shape] = [];
                    ordered[shape.Shape].push(shape.Score);
                } else break;
            }

            // let firstDiff;
            // let cumul = 0;//cumul difference between 3 highest scores 
            // let prev;
            // for (let shape in ordered) {
            //     ordered[shape] = MapUtils.of(ordered[shape]).reduce((acc, elt) => acc += elt / ordered[shape].length, 0);
            //     if (prev) cumul += ordered[shape] - prev;
            //     if(prev && !firstDiff) firstDiff=ordered[shape] - prev;
            //     prev = ordered[shape];
            // }

            //get nb guess on 3 highest different
            // let counts = {};
            // prev = undefined;
            // for (let shape of list) {
            //     if (MapUtils.of(counts).length() >= 3 && prev && prev !== shape.Shape) break;
            //     if (!prev) counts[shape.Shape] = 1;
            //     else if (prev && prev === shape.Shape) counts[shape.Shape]++;
            //     else if (prev && prev !== shape.Shape) {
            //         if (counts.hasOwnProperty(shape.Shape)) continue;
            //         else counts[shape.Shape] = 1;
            //     }
            //     prev = shape.Shape;
            // }

            //first3Res
            if (results) results += '\n';
            else results = "\"time\";\"name\";\"score\";\"res1\";\"res2\";\"res3\"\n";
            results += time+ ";\"" + result.Name + ("\";" + result.Score).replace('.',',') + (";" + list[0].Score).replace('.',',') + (";" + list[1].Score).replace('.',',') + (";"+list[2].Score).replace('.',',');
            // let first = true;
            // for (let d of MapUtils.of(counts).flatValues()) {
            //     results += (!first ? ";" : "") + d ;
            //     first = false;
            // }
        }
        console.log("result", results);
        console.log("allRes", allResults);
    }
}