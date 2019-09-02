import ArrayUtils from "./ArrayUtils";
import MapUtils from "./MapUtils";
import { DollarRecognizer, Point } from 'outlines';

export module GameModule {
	export var debug = false;
	export var currentScene: Phaser.Scene;
	var Unistrokes;
	export var game: Phaser.Game;
	export function normalizePointName(points): { x: number, y: number }[] {
		let npoints: { x: number, y: number }[] = [];
		for (let p of points) {
			npoints.push({
				x: p.hasOwnProperty('X') ? p.X : p.x,
				y: p.hasOwnProperty('Y') ? p.Y : p.y
			});
		}
		return npoints;
	}
	export function topZIndex() {
		return ArrayUtils.of(GameModule.currentScene.children.list).maxValue((c) => c.depth) + 1;
	}

	export function getUnistrokes() {
		if(MapUtils.of(Unistrokes).length()>0) return Unistrokes;
		Unistrokes={};
		let paths={
			circle: new Phaser.Curves.Path(50,50).circleTo(50,true),
			square:new Phaser.Curves.Path(0, 100).lineTo(0, 0).lineTo(100,0).lineTo(100,100).closePath(),
			triangle:new Phaser.Curves.Path(0, 50).lineTo(0, 0).lineTo(100,0).closePath(),
			rectangle:new Phaser.Curves.Path(0, 50).lineTo(0, 0).lineTo(150,0).lineTo(150,50).closePath(),
			x:new Phaser.Curves.Path(0,100).lineTo(100,0).lineTo(100,100).lineTo(0,0),
			zigzag:new Phaser.Curves.Path(0,100).lineTo(100,100).lineTo(0,0).lineTo(100,0),
			v:new Phaser.Curves.Path(0,100).lineTo(50,0).lineTo(100,100),
			line:new Phaser.Curves.Path(0,0).lineTo(0,100)
		}
		let pts:any[]=[];
		for(let shape in paths) {
			Unistrokes[shape]=[paths[shape].getPoints(Math.round(paths[shape].getLength()*0.1)).map((pt)=> new Point(pt.x,pt.y))];
		}
		return Unistrokes;
	}
}