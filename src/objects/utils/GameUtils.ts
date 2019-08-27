import ArrayUtils from "./ArrayUtils";

export module GameModule {
    export var currentScene: Phaser.Scene;
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
}