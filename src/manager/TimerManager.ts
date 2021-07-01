
export interface TimerEvent {
    thisObj: any,
    callback: Function,
    interval: number,                 //秒,调用间隔
    args?: any[],                    //参数
    count?: number                  //调用次数,不设置无限调用
}

export class TimerManager {
    private static instance: TimerManager;

    public static getInstance(): TimerManager {
        if (!this.instance) {
            this.instance = new TimerManager;
        }
        return this.instance;
    }

    private timers: Array<{ event: TimerEvent, handle: number, timestamp: number }> = [];
    private handle: NodeJS.Timer = null;
    private handleId: number = 0;

    protected constructor() {
        this.setTimeEvent();
    }

    private setTimeEvent() {
        if (this.handle) {
            clearTimeout(this.handle);
            this.handle = null;
        }
        setTimeout(() => {
            this.setTimeEvent();
            this.onTimeEvent();
        }, 100);
    }

    private onTimeEvent() {
        let time = Date.now();
        for (let i = this.timers.length - 1; i >= 0; i--) {
            const element = this.timers[i];
            if (time >= element.timestamp + element.event.interval * 1000) {
                element.timestamp = time;
                if (element.event.count != null) {
                    element.event.count--;
                    if (element.event.count <= 0) {
                        this.timers.splice(i, 1);
                    }
                }
                element.event.callback.call(element.event.thisObj, element.event.args)
            }
        }
    }


    public addTimeEvent(event: TimerEvent): number {
        this.handleId++;
        this.timers.push({ event: event, handle: this.handleId, timestamp: Date.now() })
        return this.handleId;
    }


    public removeTimeEvent(handle: number) {
        for (let i = this.timers.length - 1; i >= 0; i--) {
            const element = this.timers[i];
            if (element.handle === handle) {
                this.timers.splice(i, 1);
            }
        }
    }

    public removeTimeEventByOwner(thisObj: any) {
        for (let i = this.timers.length - 1; i >= 0; i--) {
            const element = this.timers[i];
            if (element.event.thisObj === thisObj) {
                this.timers.splice(i, 1);
            }
        }
    }

    public clearAllTimeEvent() {
        this.timers = [];
    }
}