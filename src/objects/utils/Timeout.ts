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

    private constructor(time: number, type: number) {
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
        this.startTime = new Date().getTime();
                    this.active = true;
        switch (this.type) {
            case Timeout.Type.INTERVAL:
                // this.func(this.args);
                this.id = setInterval(this.func, this.time, this.args);
                break;
            case Timeout.Type.TIMEOUT:
                this.id = setTimeout(() => {
                    this.func();
                    this.active=false;
                }, this.time, this.args);
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
        if (this.active) return;
        
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
        this.active = false;
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