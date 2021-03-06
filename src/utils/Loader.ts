import Level from "../objects/core/Level";
import Room from "../objects/core/Room";
import Entry from "../objects/core/Entry";
import { Location } from "../constants/Location";
import { ENTRY_DIFF } from "../constants/Enums";

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
        let e = new Entry(Location.parse(jsonObj.loc), jsonObj.dest, jsonObj.sign, ENTRY_DIFF.parse(jsonObj.diff));//add other params
        e.nbEnSmall = jsonObj.en_sm;
        if (jsonObj.en_med.nb) {
            e.nbEnMed = jsonObj.en_med.nb;
            e.spawnEvtMed = jsonObj.en_med.events || [];
        }
        return e;
    }
}