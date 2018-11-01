import Level from "../core/Level";
import Room from "../core/Room";
import Entry from "../core/Entry";
import { LOCATION } from "../../constants/Location";

export default class Loader {
    static loadLevel=(jsonObj):Level=> {
        let l =  new Level(jsonObj.name,jsonObj.start,jsonObj.finish);
        for(let r of jsonObj.rooms) {
            l.addRoom(Loader.loadRoom(r));
        }
        return l;
    }
    static loadRoom=(jsonObj):Room=> {
        let r = new Room(jsonObj.id,jsonObj.diff);
        for(let e of jsonObj.entries) {
            r.addEntry(Loader.loadEntry(e));
        }
        // for(let s of jsonObj.specials) {
        //     r.addSpecial();
        // }
        return r;
        
    }
    static loadEntry=(jsonObj):Entry=> {
        let e = new Entry(LOCATION.parse(jsonObj.loc),jsonObj.dest);//add other params
        return e;
    }
}