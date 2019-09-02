export default class MapUtils {
    private items: {} = {};
    static of = (newItems:{}) => { let a = new MapUtils(); a.items = newItems; return a; };
    reduce = (accumulate:Function, startVal) => {
        for (let index in this.items) {
            startVal = accumulate(startVal, this.items[index],index);
        }
        return startVal;
    };
    length = () => {
        let c=0;
        for(let index in this.items) if(this.items.hasOwnProperty(index)) c++;
        return c;
    };
    forEach = (f) => {
        for(let index in this.items) if(this.items.hasOwnProperty(index)) f(this.items[index]);
    } 
};