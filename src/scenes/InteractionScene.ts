import 'phaser';
import * as dat from 'dat.gui';
import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric';
import { CLASSIC } from 'phaser3-plugin-isometric/src/Projector';
import { SCENE_EDITOR, SCENE_INTERACT } from '../constants/Constants'
import { GameModule } from '../objects/utils/GameUtils';
import RenderRoom from '../objects/render/RenderRoom';
import RenderEntry from '../objects/render/RenderEntry';
import EditorScene from './EditorScene';
import { LOCATION } from '../constants/Enums';
import LoadScene from './LoadScene';
import Loader from '../objects/utils/Loader';
export default class InteractionScene extends Phaser.Scene {

    graphics: Phaser.GameObjects.Graphics;
    editor: EditorScene;

    infoGroup: Phaser.GameObjects.Group;

    bottomStatic = 50;
    gui:any;

    constructor() {
        super(SCENE_INTERACT);
    }

    preload = () => {
        this.load.image('btn_green', 'image/button_green.png');
        this.load.image('btn_red', 'image/button_red.png');
        this.cameras.main.setSize(GameModule.interactionPanel.width, GameModule.interactionPanel.height);

        this.graphics = this.add.graphics({
            x: 0, y: 0,
            lineStyle: { color: 0xffffff, width: 10 },
            fillStyle: { color: 0xffffff, alpha: 1 }
        });
    }

    create = () => {
        this.cameras.main.x = GameModule.interactionPanel.x;

        this.buildStatic();

        this.editor = (<EditorScene>this.game.scene.keys[SCENE_EDITOR.key]);
    }

    buildStatic() {
        //import
        let txt = this.add.text(50, this.bottomStatic, "Import JSON");
        let spr = this.add.image(75 + txt.width, txt.y, 'btn_green').setScale(0.3);
        spr.setInteractive(this.input.makePixelPerfect(100));
        spr.on('pointerup', () => {
            //import JSON
            /*let panel = this.add.group();
            let files = ["tutorial.json",
            "level_big.json",
            "level_test.json",
            "level_test1.json",
            "level_test_prev_die_event.json"];
            let y=20;
            let panelRect = new Phaser.Geom.Rectangle(0,y,300,files.length*50);
            let graph = this.add.graphics({
                x: 0, y: 0,
                lineStyle: { color: 0xff6565, width: 10 },
                fillStyle: { color: 0x656565, alpha: 1 }
            });
            graph.fillRectShape(panelRect);
            for(let file of files) {
                let fileTxt = this.add.text(15, y, file);
                let fileSpr = this.add.image(75 + fileTxt.width, y, 'btn_green').setScale(0.3);
                panel.add(fileTxt);
                panel.add(fileSpr);
                fileSpr.setInteractive(this.input.makePixelPerfect(100));
                fileSpr.on('pointerup',() => {
                    this.import(file);
                    panel.destroy(true);
                    graph.destroy();
                });
                y+=50;
            }*/
            let files = this.cache.json.get('assets').json;
            this.gui = new dat.GUI();
            for(let f of files) {
                let obj = {};
                obj[f]=this.import.bind(this,f)
                this.gui.add(obj, f);
            }


        });
        //export
        this.bottomStatic += 50;
        txt = this.add.text(50, this.bottomStatic, "Export JSON");
        spr = this.add.image(75 + txt.width, txt.y, 'btn_green').setScale(0.3);
        spr.setInteractive(this.input.makePixelPerfect(100));
        spr.on('pointerup', () => {
            // export
        });

        this.graphics.lineStyle(2, 0xff6565);
        this.graphics.lineBetween(0, this.bottomStatic + 50, GameModule.interactionPanel.width, this.bottomStatic + 50);
    }
    buildInfoFor(entity: RenderRoom | RenderEntry) {
        if (entity.constructor['name'] === RenderRoom['name']) this.buildInfoForRoom(<RenderRoom>entity);
        else if (entity.constructor['name'] === RenderEntry['name']) this.buildInfoForEntry(<RenderEntry>entity);
    }

    buildInfoForRoom(room: RenderRoom) {
        if (this.infoGroup) this.infoGroup.destroy(true);
        this.infoGroup = this.add.group();
        let y = this.bottomStatic + 100;
        for (let loc of LOCATION.enum()) {
            y += 30;
            let txt = this.add.text(50, y, loc);
            let onoff = this.add.image(200, y, room.hasEntry(loc) ? 'btn_green' : 'btn_red').setScale(0.3);
            onoff.setInteractive(this.input.makePixelPerfect(100));
            onoff.on('pointerup', () => {
                let e;
                if (room.hasEntry(loc)) e = this.editor.deleteEntry(room, loc);
                else e = this.editor.addEntry(room, loc);
            });
            this.infoGroup.add(onoff);
            this.infoGroup.add(txt);
        }
        if(this.gui) this.gui.destroy();
        this.gui=new dat.GUI();
        for(let loc of LOCATION.enum()) {
            let obj={};
            obj[loc]=room.hasEntry(loc);
            this.gui.add(obj,loc).name(loc).onChange((val) => {
                let e;
                if (!val) e = this.editor.deleteEntry(room, loc);
                else e = this.editor.addEntry(room, loc);
            });
        }
    }

    buildInfoForEntry(entry: RenderEntry) {
        if (this.infoGroup) this.infoGroup.destroy(true);
        this.infoGroup = this.add.group();
        let y = this.bottomStatic + 100;
        let txt = this.add.text(50, y, "Add room");
        let spr = this.add.image(75 + txt.width, txt.y, 'btn_green').setScale(0.3);
        spr.setInteractive(this.input.makePixelPerfect(100));
        spr.on('pointerup', () => {
            this.editor.addRoom(entry);
        });
        this.infoGroup.add(spr);
        this.infoGroup.add(txt);
    }

    import(fileName) {
        this.gui.destroy();
        this.editor.loadLevel(this.cache.json.get('level_big').Level);
    }
}