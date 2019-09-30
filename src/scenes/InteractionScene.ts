import 'phaser';
import * as dat from 'dat.gui';
import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric';
import { CLASSIC } from 'phaser3-plugin-isometric/src/Projector';
import { SCENE_EDITOR, SCENE_INTERACT } from '../constants/Constants'
import { GameModule } from '../objects/utils/GameUtils';
import RenderRoom from '../objects/render/RenderRoom';
import RenderEntry from '../objects/render/RenderEntry';
import EditorScene from './EditorScene';
import { LOCATION, ENTRY_DIFF, ENEMY_EVENTS } from '../constants/Enums';
import LoadScene from './LoadScene';
import Loader from '../objects/utils/Loader';
import { isAbsolute } from 'path';
export default class InteractionScene extends Phaser.Scene {

    graphics: Phaser.GameObjects.Graphics;
    editor: EditorScene;

    name = 'level';

    infoGroup: Phaser.GameObjects.Group;

    bottomStatic = 50;
    gui: any;
    fileFolder: any;
    roomFolder: any;
    entryFolder: any;

    modalEvents: any;

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

        this.gui = new dat.GUI();
        this.buildModal();
        this.buildStatic();

        this.editor = (<EditorScene>this.game.scene.keys[SCENE_EDITOR.key]);
    }

    buildStatic() {
        this.gui.add(this, "name").name("Name");
        this.gui.addFolder("Static");
        this.gui.add(this, "importLevel").name("Import Level");
        this.gui.add(this, "exportLevel").name("Export Level");
        this.gui.add(this, "logLevel").name("Log Level");
    }
    buildModal() {
        this.modalEvents = document.createElement("div");
        document.body.appendChild(this.modalEvents);
        this.modalEvents.id = "modalEvents";
        this.modalEvents.innerHTML = '<div id="choser" style="display:inline"><select id="evt"><option value="enemyKilled">enemyKilled</option></select>' +
            '<input id="arg"/><button>Ok</button></div>' +
            '<div id="evtList"></div>' +
            '<div><button id="saveEvts">Save</button><button id="cancel">Cancel</button></div>';
        (<Element>document.querySelector('#modalEvents #choser button')).addEventListener('click', function (event) {
            let evtList = <HTMLDivElement>document.querySelector('#modalEvents #evtList');
            let newDiv = document.createElement('div');
            let arg = (<HTMLInputElement>document.querySelector('#modalEvents #choser #arg')).value;
            let optionSelected = (<HTMLSelectElement>document.querySelector('#modalEvents #choser #evt')).options[(<HTMLSelectElement>document.querySelector('#modalEvents #choser #evt')).selectedIndex].value;
            newDiv.innerHTML = optionSelected + arg + ' <input type="checkbox" checked="checked" value="' + (optionSelected + arg) + '"/>';
            evtList.appendChild(newDiv);
        });
        (<Element>document.querySelector('#modalEvents #cancel')).addEventListener('click', (event) => {
            this.modalEvents.style.display = 'none';
        });
        this.modalEvents.style.display = 'none';
    }
    logLevel() {
        console.log(this.name, RenderRoom.rooms);
    }
    importLevel() {
        if (this.fileFolder) this.gui.removeFolder(this.fileFolder);
        this.fileFolder = this.gui.addFolder("File List");
        let files = this.cache.json.get('assets').json;
        for (let f of files) {
            let obj = {};
            obj[f] = this.import.bind(this, f)
            this.fileFolder.add(obj, f);
        }
        this.fileFolder.open();
    }
    exportLevel() {
        let level: any = { rooms: [] };
        for (let room of RenderRoom.rooms) {
            level.rooms.push(room.toExportJSON());
            if (room.isStart) level.start = room.id;
            if (room.isFinish) level.finish = room.id;
        }
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(level));
        var dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", this.name+".json");
        dlAnchorElem.click();
        dlAnchorElem.remove();
    }
    buildInfoFor(entity: RenderRoom | RenderEntry) {
        if (entity.constructor['name'] === RenderRoom['name']) this.buildInfoForRoom(<RenderRoom>entity);
        else if (entity.constructor['name'] === RenderEntry['name']) this.buildInfoForEntry(<RenderEntry>entity);
    }

    buildInfoForRoom(room: RenderRoom) {
        this.safeCloseGUI();
        this.roomFolder = this.gui.addFolder("Room");
        this.roomFolder.add(room, 'id');
        this.roomFolder.add(room, 'isStart').name('Start').onChange((val) => {
            this.editor.changeStart(val, room);
        });
        this.roomFolder.add(room, 'isFinish').name('Finish').onChange((val) => {
            this.editor.changeFinish(val, room);
        });
        for (let loc of LOCATION.enum()) {
            let obj = {};
            obj[loc] = room.hasEntry(loc);
            this.roomFolder.add(obj, loc).name(loc).onChange((val) => {
                let e;
                if (!val) e = this.editor.deleteEntry(room, loc);
                else e = this.editor.addEntry(room, loc);
            });
        }
        this.roomFolder.open();
    }

    buildInfoForEntry(entry: RenderEntry) {
        this.safeCloseGUI();
        this.entryFolder = this.gui.addFolder("Entry");
        let obj = { addRoom: () => this.editor.addRoom(entry) };
        this.entryFolder.add(obj, "addRoom").name("Add room");
        this.entryFolder.add(entry, 'diff', ['LOW', 'NEUTRAL', 'HIGH']).name("Difficulty");
        this.entryFolder.add(entry, 'sign', ['SQUARE', 'TRIANGLE', 'CIRCLE']).name("Sign");
        this.entryFolder.add(entry, 'nbEnSmall').min(1).step(1);
        let medFolder;
        try {
            medFolder = this.entryFolder.addFolder("Enemy Med");
        } catch (e) {
            this.entryFolder.removeFolder("Enemy Med");
            medFolder = this.entryFolder.addFolder("Enemy Med");
        }
        medFolder.add(entry, 'nbRndMed').min(0).step(1);
        let medObj = { showEvents: () => { this.showModalEvents(entry, 'spawnEvtMed'); } }
        medFolder.add(medObj, "showEvents").name("Events (" + entry.spawnEvtMed.length + ")");
        let hardFolder;
        try {
            hardFolder = this.entryFolder.addFolder("Enemy Hard");
        } catch (e) {
            this.entryFolder.removeFolder("Enemy Hard");
            hardFolder = this.entryFolder.addFolder("Enemy Hard");
        }
        hardFolder.add(entry, 'nbRndHard').min(0).step(1);
        let hardObj = { showEvents: () => { this.showModalEvents(entry, 'spawnEvtHard'); } }
        hardFolder.add(hardObj, "showEvents").name("Events (" + entry.spawnEvtHard + ")");
        this.entryFolder.open();
    }

    showModalEvents(entry, evtsProp) {
        this.modalEvents.style.display = '';
        this.buildEvtList(entry[evtsProp]);
        (<Element>document.querySelector('#modalEvents #saveEvts')).addEventListener('click', (event) => {
            let newEvts: any[] = [];
            let evtList = (document.querySelectorAll('#modalEvents #evtList div') as any as Array<HTMLElement>);
            evtList.forEach(elt => {
                if ((<any>elt.children[0]).checked) newEvts.push((<any>elt.children[0]).value);
            });
            entry[evtsProp] = newEvts;
            this.modalEvents.style.display = 'none';
        });
    }

    buildEvtList(events) {
        let innerHTML = '';
        for (let evt of events) {
            innerHTML += '<div>' + evt + ' <input type="checkbox" checked="checked" value="' + evt + '"/>' + '</div>';
        }
        (<HTMLDivElement>document.querySelector('#modalEvents #evtList')).innerHTML = innerHTML;
    }

    import(fileName) {
        this.gui.removeFolder(this.fileFolder);
        fileName = fileName.substring(0, fileName.indexOf('.json'));
        this.editor.loadLevel(this.cache.json.get(fileName).Level);
    }

    safeCloseGUI() {
        try {
            if (this.entryFolder && !this.entryFolder.closed) this.gui.removeFolder(this.entryFolder);
        } catch (e) { }
        try {
            if (this.roomFolder && !this.roomFolder.closed) this.gui.removeFolder(this.roomFolder);
        } catch (e) { }
    }
}