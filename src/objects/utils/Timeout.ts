export class Timeout {
    static Type = { TIMEOUT: 0, INTERVAL: 1 };

    id: number;
    name: string;
    func: Function;
    args: any[];
    repeat: boolean;
    time: number;
    active: boolean;
    waitTime: number;

    startTime: number;

    constructor(func: Function, repeat: boolean, time: number, autoStart: boolean, args?: any[], name?: string) {
        this.repeat = repeat;
        this.name = name || '';
        this.func = func;
        this.args = args || [];
        this.time = time;
        this.startTime = new Date().getTime();
        if (autoStart) {
            this.active = true;
            if (repeat) this.id = setInterval((args) => { func(args); this.startTime = new Date().getTime(); }, time, args);
            else this.id = setTimeout(func, time, args);
        }

    }

    start() {
        if (this.active) {
            console.error('Timeout ' + this.name + ' already started', this.func);
            return;
        }
        if (this.repeat) this.id = setInterval(this.func, this.time, this.args);
        else this.id = setTimeout(this.func, this.time, this.args);
        this.active = true;
    }

    pause() {
        if (!this.active) {
            console.error('Timeout ' + this.name + ' is not active', this.func);
            return;
        }
        let currTime = new Date().getTime();
        if (this.repeat) {
            this.waitTime -= currTime - this.startTime;
            clearInterval(this.id);
        } else {
            this.time -= currTime - this.startTime;
            clearTimeout(this.id);
        }
        this.active=false;
    }

    resume() {
        if (this.active) {
            console.error('Timeout ' + this.name + ' already started', this.func);
            return;
        }
        if (this.repeat) {
            this.id = setTimeout(
                (args) =>
                    this.id = setInterval(() => {
                        this.func(args);
                        this.startTime = new Date().getTime();
                    }, this.time, this.args),
                this.waitTime,
                this.args
            );
        } else {
            this.startTime = new Date().getTime()
            this.id = setTimeout(this.func, this.time, this.args);
        }
        this.active=true;
    }

    destroy() {
        if(this.repeat) clearInterval(this.id);
        else clearTimeout(this.id);
        return this.time - new Date().getTime() - this.startTime;
    }


}