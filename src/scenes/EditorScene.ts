import 'phaser';
import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric';
import { CLASSIC } from 'phaser3-plugin-isometric/src/Projector';
import { SCENE_EDITOR, SCENE_INTERACT } from '../constants/Constants'
import { GameModule } from '../objects/utils/GameUtils';
import Renderer, { renderer } from '../objects/render/Renderer';
import RenderRoom from '../objects/render/RenderRoom';
import RenderEntry from '../objects/render/RenderEntry';
import InteractionScene from './InteractionScene';
import { LOCATION } from '../constants/Enums';
import { RenderUtils } from '../objects/utils/RenderUtils';
// import Level from '../objects/core/Level';
export default class EditorScene extends Phaser.Scene {

    mapMove: any = undefined;
    graphics: Phaser.GameObjects.Graphics;

    interact: InteractionScene;

    selected: RenderRoom | RenderEntry;
    startIndic:Phaser.GameObjects.Image;
    finishIndic:Phaser.GameObjects.Image;

    constructor() {
        super(SCENE_EDITOR)
    }

    preload = () => {
        GameModule.currentScene = this;
        this.load.scenePlugin({
            key: 'IsoPlugin',
            url: IsoPlugin,
            sceneKey: 'iso'
        });
        this.load.scenePlugin({
            key: 'IsoPhysics',
            url: IsoPhysics,
            sceneKey: 'isoPhysics'
        });
        this.graphics = this.add.graphics({
            x: 0, y: 0,
            lineStyle: { color: 0xffffff, width: 10 },
            fillStyle: { color: 0xffffff, alpha: 1 }
        });
        Renderer.init();
    }

    create = () => {
        this.interact = this.game.scene.keys[SCENE_INTERACT.key];
        // ISO PLUGIN
        // this.isoPhysics.world.gravity.setTo(0, 0, -500);
        this.cameras.main.setSize(GameModule.mapPanel.width, GameModule.mapPanel.height);
        // let rx = 0.5 * GameModule.mapPanel.width;
        // let ry = 0.75 * GameModule.mapPanel.height;
        let rx=0;let ry =0;
        this.iso.projector.origin.setTo(rx, ry);
        this.iso.projector.projectionAngle = CLASSIC;

        this.graphics.fillGradientStyle(0x75A6F8, 0x75A6F8, 0x002054, 0x002054);
        this.graphics.fillRectShape(GameModule.mapPanel);
        this.graphics.lineStyle(2, 0xff6565);
        this.graphics.lineBetween(GameModule.interactionPanel.x, GameModule.interactionPanel.y, GameModule.interactionPanel.x, GameModule.interactionPanel.bottom);
        
        this.input.on('pointerdown', (pointer) => {
            if (!GameModule.mapPanel.contains(pointer.x, pointer.y)) {
                this.mapMove = undefined;
                return;
            }
            this.mapMove = { x: renderer.rendererContainer.x, y: renderer.rendererContainer.y };
        });
        this.input.on('pointermove', (pointer) => {
            if (!GameModule.mapPanel.contains(pointer.x, pointer.y)) {
                this.mapMove = undefined;
                return;
            }
            if (this.mapMove) {
                renderer.rendererContainer.x = (pointer.x - pointer.downX) + this.mapMove.x;
                renderer.rendererContainer.y = (pointer.y - pointer.downY) + this.mapMove.y;
            }
        });
        this.input.on('pointerup', (pointer) => {
            this.mapMove = undefined;
        });
        let room = renderer.addRoom();
        this.genericPointerEventSprite(room);
        console.log(this);
    }

    update(time,delta) {
        renderer.update(time,delta);
    }

    addRoom(entry:RenderEntry) {
        if(entry.dest) {
            this.error("Room exists");
            return;
        }
        let room = renderer.addRoom(entry);
        this.genericPointerEventSprite(room);
        entry.dest = room;
        let newEntry = this.addEntry(room,LOCATION.name(LOCATION.opposite(LOCATION.parse(entry.location))));
        newEntry.dest = entry.source;
        this.select(room);
        return room;
    }

    deleteRoom() {

    }

    addEntry(room: RenderRoom, loc) {
        let e = renderer.addEntry(room,loc);
        e.source = room;
        this.genericPointerEventSprite(e);
        this.select(e);
        return e;
    }

    deleteEntry(room: RenderRoom, loc) {
        renderer.deleteEntry(room,loc);
    }

    select(entity: RenderEntry | RenderRoom) {
        this.interact.buildInfoFor(entity);
        renderer.all((spr) => spr.clearTint());
        entity.sprite.setTint(0x6565ff);
        this.selected=entity;
    }

    genericPointerEventSprite(entity) {
        entity.sprite.on('pointerup', () => {
            this.select(entity);
        });
        entity.sprite.on('pointerover', () => {
            if(this.selected === entity) return;
            entity.sprite.setTint(0xff6565);
        });
        
        entity.sprite.on('pointerout', () => {
            if(this.selected === entity) return;
            entity.sprite.clearTint();
        });
    }

    loadLevel(level) {
        let levelMap = {};
        for(let r of level.rooms) levelMap[r.id]={room:r};
        let startRoom = levelMap[level.start].room;
        let room = renderer.addRoom();
        room.id=startRoom.id;
        room.diff=startRoom.diff;
        room.drop=startRoom.drop || '';
        levelMap[room.id].render = room;
        for(let e of startRoom.entries) {
            let entry = this.addEntry(room,e.loc);
            if(e.dest) this.loadRoom(levelMap[e.dest].room,entry,levelMap);
        }
    }

    loadRoom(room,entry,levelMap) {
        let renderRoom = <RenderRoom>this.addRoom(entry);
        renderRoom.id=room.id;
        renderRoom.diff=room.diff;
        renderRoom.drop=room.drop || '';
        levelMap[room.id].render = renderRoom;
        for(let e of room.entries) {
            let entry = this.addEntry(<RenderRoom>renderRoom,e.loc);
            entry.diff=e.diff;entry.sign=e.sign;
            entry.nbEnSmall = e.en_sm;
            entry.nbRndMed=e.en_med.nb;
            entry.spawnEvtMed=e.en_med.events;
            entry.nbRndHard=e.en_big.nb || 0;
            entry.spawnEvtHard=e.en_big.events || [];
            if(e.dest && !levelMap[e.dest].render) this.loadRoom(levelMap[e.dest].room,entry,levelMap);
        }
    }

    error(txt) {
        let txtSpr = this.add.text(50,50,txt,{ color: 'red', size: '50px' });
        this.tweens.add({
            targets:txtSpr,
            duration:5000,
            alpha:0,
            onComplete:() => {
                txtSpr.destroy();
            }
        })
    }

    changeStart(isStart,room) {
        let loc = RenderUtils.topXYFromIsoSprite(room.sprite,true);
        renderer.changeStart(loc,isStart);
    }
    
    changeFinish(isFinish,room) {        
        let loc = RenderUtils.topXYFromIsoSprite(room.sprite,true);
        renderer.changeFinish(loc,isFinish);
    }
}
