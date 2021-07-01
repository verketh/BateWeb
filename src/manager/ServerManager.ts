import WebSocket = require("ws");
import { EvaluateManager } from "./EvaluateManager";
import { LoggerManager, LoggerType } from "./LoggerManager";
import { TimerManager } from "./TimerManager";

export interface HookPerformanceData {
    caches: number,     //缓存的资源数
    gpuSize: number,    //显存大小
    tween: number,       //缓动数量
}

export enum HookMessageType {
    PERFORMANCE,
    BUTTON_POS_TOP,
    BUTTON_POS_RAND,
    LOGIN_CONFIG,
}

export interface HookMessage {
    id: HookMessageType,
    rpc?: number,
    message: any,
}

export interface HookLoginConfig {
    loginClass: string,         //登录界面类名
    loginAccount: string,       //账号
    loginPassword: string,      //密码
    loginAccountEdit: string,   //账号编辑框在类中的变量名
    loginPasswordEdit: string,  //密码编辑框在类中的变量名
    loginMethod: string,        //登录按钮在类中的方法
}

export class ServerManager {
    private static instance: ServerManager;

    public static getInstance(): ServerManager {
        if (!this.instance) {
            this.instance = new ServerManager;
        }
        return this.instance;
    }

    private wss: WebSocket.Server = null;
    private client: WebSocket = null;
    private rpcId: number = 0;
    private rpcArr: Array<{ rpc: number, callback: (data: any) => void, timestamp: number }> = [];
    protected constructor() {
        TimerManager.getInstance().addTimeEvent({ thisObj: this, callback: this.onTimerEvent, interval: 1 })
    }

    private onTimerEvent() {
        let time = Date.now();
        for (let i = this.rpcArr.length - 1; i >= 0; i--) {
            const element = this.rpcArr[i];
            if (time - element.timestamp >= 3000) {
                element.callback(null);
                this.rpcArr.splice(i, 1);
            }
        }
    }

    public startServer(port: number) {
        if (this.wss) {
            this.wss.close();
            this.wss = null;
        }
        this.wss = new WebSocket.Server({ port: port }, () => {
            console.log("start server port:" + port);
        });

        this.wss.on('connection', (socket: WebSocket) => {
            this.client = socket;
            LoggerManager.getInstance().warn(LoggerType.everything, "HookWebClient连接")
            socket.on("message", (data: WebSocket.Data) => {
                this.onMessage(data)
            })

            socket.on("close", (code: number, reason: string) => {
                this.client = null;
                LoggerManager.getInstance().warn(LoggerType.everything, code, reason)
            })
        })
    }

    private onMessage(data: WebSocket.Data) {
        try {
            let json: HookMessage = JSON.parse(data as string);
            if (json.rpc != null) {
                this.onRequest(json);
            } else {
                EvaluateManager.getInstance().onMessage(json);
            }
        } catch (error) {
            LoggerManager.getInstance().error(LoggerType.everything, error);
        }
    }

    public request(requestId: HookMessageType, data: any, callback: (data: any) => void) {
        if (!this.client) {
            callback(null);
            LoggerManager.getInstance().error(LoggerType.everything, "客户端没连接");
            return;
        }
        this.rpcId++;
        let msg: HookMessage = {
            id: requestId,
            rpc: this.rpcId,
            message: data
        }
        this.rpcArr.push({ rpc: this.rpcId, callback: callback, timestamp: Date.now() });
        this.client.send(JSON.stringify(msg));
    }

    private onRequest(data: any) {
        for (let i = 0; i < this.rpcArr.length; i++) {
            const element = this.rpcArr[i];
            if (element.rpc == data.rpc) {
                this.rpcArr.splice(i, 1);
                element.callback(data);
                break;
            }
        }
    }
}