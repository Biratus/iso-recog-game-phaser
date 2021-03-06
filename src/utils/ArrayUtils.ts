export default class ArrayUtils {
    private items: any[] = [];
    static of = (newItems:any[]) => { let a = new ArrayUtils(); a.items = newItems; return a; };
    max = (getMax, maxStart?) => {
        let maxElt;
        maxStart = maxStart === undefined ? -1 : maxStart;
        for (let elt of this.items) {
            let val = getMax(elt);
            if (maxStart < val) { maxElt = elt; maxStart = val; }
        }
        return maxElt;
    };
    maxValue = (getMax, maxStart?) => {
        maxStart = maxStart === undefined ? -1 : maxStart;
        for (let elt of this.items) {
            let val = getMax(elt);
            if (maxStart < val) maxStart = val;
        }
        return maxStart;
    };
    minValue = (getMin, minStart?) => {
        minStart = minStart === undefined ? 1 : minStart;
        for (let elt of this.items) {
            let val = getMin(elt);
            if (minStart > val) minStart = val;
        }
        return minStart;
    };
};