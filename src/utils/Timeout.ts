import { GameModule } from "./GameModule";

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

    lastActivate:number;

    random = () => 0;

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

    start(delay = 0) {
        if (this.active) {
            console.warn('Timeout ' + this.name + ' already started', this.func);
            return this;
        }
        this.startTime = new Date().getTime();
        this.active = true;
        // switch (this.type) {
        //     case Timeout.Type.INTERVAL:
        //         // this.func(this.args);
        //         this.id = setInterval(this.func, this.time+this.random(), this.args);
        //         break;
        //     case Timeout.Type.TIMEOUT:
        //         this.id = setTimeout(() => {
        //             this.func();
        //             this.active = false;
        //         }, this.time+this.random(), this.args);
        //         break;
        // }
        this.id = setTimeout(() => this.activate(), delay + this.time + this.random(), this.args);
        return this;
    }

    private activate() {
        if(GameModule.debug) {
            let ellapsed = new Date().getTime()-(this.lastActivate?this.lastActivate:this.startTime); 
            // console.log('activate id:'+this.id+' ellapsed '+ellapsed);
        }
        this.lastActivate = new Date().getTime() 
        this.func(this.args);
        if(!this.active) return;
        switch (this.type) {
            case Timeout.Type.INTERVAL:
                this.id = setTimeout(() => this.activate(), this.time + this.random(), this.args);
                break;
            case Timeout.Type.TIMEOUT:
                this.active = false;
                break;
        }
    }

    pause() {
        if (!this.active) {
            console.warn('Timeout ' + this.name + ' is not active', this.func);
            return;
        }
        let currTime = new Date().getTime();
        this.active = false;
        switch (this.type) {
            case Timeout.Type.INTERVAL:
                this.waitTime -= currTime - this.startTime;
                clearTimeout(this.id);
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
                    (args) => {
                        this.id = setTimeout(() => {

                            this.startTime = new Date().getTime();
                            this.activate()
                        }, this.time + this.random(), this.args);
                        // this.id = setInterval(() => {
                        //     this.func(args);
                        //     this.startTime = new Date().getTime();
                        // }, this.time, this.args)
                    },
                    this.waitTime,this.args
                );
                break;
            case Timeout.Type.TIMEOUT:
                this.startTime = new Date().getTime();
                this.id = setTimeout(this.func, this.time, this.args);
                break;
        }
    }

    destroy() {
        this.active = false;
        clearTimeout(this.id);
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

    randomized(min, max): Timeout {
        this.random = () => Math.map(Math.random(), 0, 1, min, max);
        return this;
    }

    static testInterval() {
        let t = new Date().getTime();
        let interval = 1.5 * 1000;
        Timeout.every(interval).randomized(0, 0.5 * 1000).do(() => {
            let ellapsed = new Date().getTime()-t;
            console.log("time since last "+ellapsed+" random = "+(ellapsed-interval));
            t = new Date().getTime();
        }).start();
    }

}