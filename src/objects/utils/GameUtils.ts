
export module GameModule  {
     export function normalizePointName(points):{x:number,y:number}[] {
        let npoints:{x:number,y:number}[] = [];
        for(let p of points) {

            npoints.push({
                x:p.hasOwnProperty('X')?p.X:p.x,
                y:p.hasOwnProperty('Y')?p.Y:p.y
            });
        }
        return npoints;
    }
}