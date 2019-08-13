import { Time } from "phaser";

export class Timeout {
    static Type = { TIMEOUT: 0, INTERVAL: 1 };

    id: number;
    name = '';
    func: Function;
    args: any[];
    repeat: boolean;
    time: number;
    active: boolean;
    waitTime: number;

    type: number;

    startTime: number;

    /*constructor(func: Function, repeat: boolean, time: number, autoStart: boolean, args?: any[], name?: string) {
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

    }*/

    constructor(time: number, type: number) {
        this.type = type;
        this.time = time;
    }

    do(func: Function, args?: any[]) {
        this.func = func;
        this.args = args || [];
        return this;
    }

    start() {
        if (this.active) {
            console.error('Timeout ' + this.name + ' already started', this.func);
            return this;
        }
        this.active=true;
        this.startTime = new Date().getTime();
        switch (this.type) {
            case Timeout.Type.INTERVAL:
                this.id = setInterval(this.func, this.time, this.args);
                break;
            case Timeout.Type.TIMEOUT:
                this.id = setTimeout(this.func, this.time, this.args);
                break;
        }
        return this;
    }

    pause() {
        if (!this.active) {
            console.error('Timeout ' + this.name + ' is not active', this.func);
            return;
        }
        let currTime = new Date().getTime();
        this.active = false;
        switch (this.type) {
            case Timeout.Type.INTERVAL:
                this.waitTime -= currTime - this.startTime;
                clearInterval(this.id);
                break;
            case Timeout.Type.TIMEOUT:
                this.time -= currTime - this.startTime;
                clearTimeout(this.id);
                break;
        }
    }

    resume() {
        if (this.active) {
            console.error('Timeout ' + this.name + ' already started', this.func);
            return;
        }
        this.active = true;
        switch (this.type) {
            case Timeout.Type.INTERVAL:
                this.id = setTimeout(
                    (args) =>
                        this.id = setInterval(() => {
                            this.func(args);
                            this.startTime = new Date().getTime();
                        }, this.time, this.args),
                    this.waitTime,
                    this.args
                );
                break;
            case Timeout.Type.TIMEOUT:
                this.startTime = new Date().getTime()
                this.id = setTimeout(this.func, this.time, this.args);
                break;
        }
    }

    destroy() {
        switch (this.type) {
            case Timeout.Type.INTERVAL: clearInterval(this.id); break;
            case Timeout.Type.TIMEOUT: clearTimeout(this.id); break;
        }
        return this.time - new Date().getTime() - this.startTime;
    }

    static in(time: number): Timeout {
        let t = new Timeout(time, Timeout.Type.TIMEOUT);
        return t;
    }

    static every(time: number): Timeout {
        let t = new Timeout(time, Timeout.Type.INTERVAL);
        return t;
    }

}