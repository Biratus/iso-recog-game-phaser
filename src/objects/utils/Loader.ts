import { ENEMY_SPAWN_EVENT, ENTRY_DIFF, LOCATION } from "../../constants/Enums";
import Entry from "../core/Entry";
import Level from "../core/Level";
import Room from "../core/Room";

export default class Loader {
    static loadLevel = (jsonObj): Level => {
        let l = new Level(jsonObj.name, jsonObj.start, jsonObj.finish);
        for (let r of jsonObj.rooms) {
            l.addRoom(Loader.loadRoom(r));
        }
        return l;
    }
    static loadRoom = (jsonObj): Room => {
        let r = new Room(jsonObj.id, jsonObj.diff);
        for (let e of jsonObj.entries) {
            r.addEntry(Loader.loadEntry(e));
        }
        // for(let s of jsonObj.specials) {
        //     r.addSpecial();
        // }
        return r;

    }
    static loadEntry = (jsonObj): Entry => {
        let e = new Entry(LOCATION.parse(jsonObj.loc), jsonObj.dest, jsonObj.sign, ENTRY_DIFF.parse(jsonObj.diff));//add other params
        e.nbEnSmall = jsonObj.en_sm;
        if (jsonObj.en_med.nb) {
            e.nbEnMed = jsonObj.en_med.nb;
            e.spawnEvtMed = jsonObj.en_med.events;
        }
        return e;
    }
}