import Room from "../core/Room";
import Entry from "../core/Entry";

export var LevelUtils = {
    entryBetween: (source:Room,dest:Room):Entry | undefined => {
        
        if(!dest) console.error('No room destination');
        for(let entry of source.entries()) {
            if(entry.destId == dest._id) return entry;
        }
        return undefined;
    }
}