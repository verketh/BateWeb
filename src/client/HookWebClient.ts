/**
 * 这个与游戏运行在相同的环境下，这里不可以调用外部的方法和变量，
 * 但可以调用游戏里的方法和变量
 * @param param 
 */
export const HookWebClientFun = function (param: string) {

    interface HookPerformanceData {
        caches: number,     //缓存的资源数
        gpuSize: number,    //显存大小
        tween: number,       //缓动数量
    }

    interface HookLoginConfig {
        loginClass: string,         //登录界面类名
        loginAccount: string,       //账号
        loginPassword: string,      //密码
        loginAccountEdit: string,   //账号编辑框在类中的变量名
        loginPasswordEdit: string,  //密码编辑框在类中的变量名
        loginMethod: string,        //登录按钮在类中的方法
    }

    enum HookMessageType {
        PERFORMANCE,
        BUTTON_POS_TOP,
        BUTTON_POS_RAND,
        LOGIN_CONFIG,
    }

    interface HookMessage {
        id: HookMessageType,
        rpc?: number,
        message: any,
    }
    class HookEgretManager {
        private static instance: HookEgretManager = null;
        public static getInstance() {
            if (!this.instance) {
                this.instance = new HookEgretManager;
            }
            return this.instance;
        }


        private loginConfig: HookLoginConfig = null;
        public isAddTouchPoint: boolean = false;
        private shape: egret.Shape = null;
        private viewTestTime: number = Date.now();

        isInit(): boolean {
            return (egret && RES != null);
        }

        public addTouchPoint() {
            if (this.isAddTouchPoint == false || this.shape != null) {
                return;
            }
            let stage = this.getStage();
            if (stage == null) {
                return;
            }
            this.shape = new egret.Shape();
            this.shape.graphics.beginFill(0xFF0000, 1);
            this.shape.graphics.drawCircle(0, 0, 10);
            this.shape.graphics.endFill();
            stage.addChild(this.shape);
            stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        }

        private onTouchBegin(e: egret.TouchEvent) {
            if (!this.shape) {
                return;
            }
            this.shape.x = e.stageX
            this.shape.y = e.stageY
        }


        /**
         * 获取舞台对象
         * @returns 
         */
        private getStage(): egret.Stage {
            let containerList = document.querySelectorAll(".egret-player");
            if (!containerList) {
                return;
            }
            let length = containerList.length;
            for (let i = 0; i < length; i++) {
                let container = containerList[i];
                let player = container["egret-player"];
                if (player) {
                    return player.stage;
                }
            }
            return null;
        }

        public getRandTouchTargetPosition(): { x: number, y: number } {
            let arr = this.getRandTouchTarget();
            if (arr.length <= 0) {
                return null;
            }
            let node = arr[Math.floor(Math.random() * 100000) % arr.length];
            return this.calculatePosition(node);
        }

        public getTopTouchTargetPosition(): { x: number, y: number } {
            let node = this.getTopTouchTarget();
            if (node) {
                return this.calculatePosition(node);
            }
            return null;
        }

        /**
         * 随机获取一个触摸对象
         */
        public getRandTouchTarget(): Array<egret.DisplayObject> {
            let arr = [];
            let stage: egret.Stage = this.getStage();
            if (stage == null) {
                return arr;
            }
            let start = Date.now();
            this.findAllTouchTarget(stage, arr);
            return arr;
        }

        /**
         * 获取一个顶层的触摸对象
         */
        public getTopTouchTarget(): egret.DisplayObject {
            let stage: egret.Stage = this.getStage();
            if (stage == null) {
                return null;
            }
            let node = this.findTouchTarget(stage);
            if (node == stage) {
                return null;
            }
            return node;
        }

        /**
         * 获取所有触摸对象
         * @param target 
         * @param arr 
         * @returns 
         */
        private findAllTouchTarget(target: egret.DisplayObject, arr: Array<egret.DisplayObject>) {
            if (!target) {
                return null;
            }
            const children = target.$children;
            for (let i = children.length - 1; i >= 0; i--) {
                let child = children[i];
                if (child['$touchChildren']) {
                    this.findAllTouchTarget(child, arr);
                }
                if (this.canTouch(child)) {
                    arr.push(child);
                }
            }
            if (this.canTouch(target)) {
                arr.push(target);
            }
        }

        /**
         * 查找一个触摸对象
         * @param target 
         * @returns 
         */
        private findTouchTarget(target: egret.DisplayObject): egret.DisplayObject {
            if (!target) {
                return null;
            }
            const children = target.$children;
            for (let i = children.length - 1; i >= 0; i--) {
                let child = children[i];
                if (child['$touchChildren']) {
                    let node = this.findTouchTarget(child);
                    if (node && this.canTouch(node)) {
                        return node;
                    }
                }
                if (this.canTouch(child)) {
                    return child;
                }
            }
            return this.canTouch(target) ? target : null;
        }

        private canTouch(target: egret.DisplayObject) {
            return target.$touchEnabled && target.visible
                && (target.hasEventListener(egret.TouchEvent.TOUCH_MOVE) || target.hasEventListener(egret.TouchEvent.TOUCH_BEGIN)
                    || target.hasEventListener(egret.TouchEvent.TOUCH_END) || target.hasEventListener(egret.TouchEvent.TOUCH_CANCEL)
                    || target.hasEventListener(egret.TouchEvent.TOUCH_TAP) || target.hasEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE))
        }

        private hasProperty(target: any, pro: string) {
            return Object.prototype.hasOwnProperty.call(target, pro);
        }


        private getPerformanceData(): HookPerformanceData {
            if (!RES) {
                return null;
            }
            let res = RES as any;
            let gpuSize = 0;
            if (res.profile) {
                gpuSize = res.profile(false);
                if (gpuSize == null) {
                    console.warn("需要修改Egret源码，在assetsmanager.js RES.profile函数末尾添加 return (totalImageSize / 1024).toFixed(3);")
                    gpuSize = 0;
                }
            }

            let tween = (egret.Tween as any)._tweens.length;

            let caches = 0;
            if (RES.host && RES.host.state != null) {
                caches = Object.keys(RES.host.state).length;
            }

            let data: HookPerformanceData = {
                caches: caches,     //缓存的资源数
                gpuSize: gpuSize,                               //Gpu 大小
                tween: tween
            }
            return data;
        }

        private findView(name: string) {
            let stage: egret.Stage = this.getStage();
            if (stage == null) {
                return null;
            }
            return this.findViewByClassName(stage, name)
        }

        private findViewByClassName(target: egret.DisplayObject, name: string): egret.DisplayObject {
            if (!target) {
                return null;
            }
            if (target.constructor.name == name) {
                return target;
            }
            const children = target.$children;
            for (let i = children.length - 1; i >= 0; i--) {
                let child = children[i];
                if (child.constructor.name == name) {
                    return child;
                }
                if (child.$children == null) {
                    continue;
                }
                let node = this.findViewByClassName(child, name);
                if (node) {
                    return node;
                }
            }
            return null;
        }

        private calculatePosition(target: egret.DisplayObject): { x: number, y: number } {
            let pos = target.localToGlobal();
            if (target.anchorOffsetX == 0) {
                pos.x += target.width / 2;
            } else if (target.anchorOffsetX == target.width) {
                pos.x -= target.width / 2;
            }

            if (target.anchorOffsetY == 0) {
                pos.y += target.height / 2;
            } else if (target.anchorOffsetY == target.height) {
                pos.x -= target.height / 2;
            }

            return { x: pos.x, y: pos.y };
        }

        /*******************************************************网络消息处理*******************************************************/
        /**
         * 获取最顶层触摸对象位置
         * @param data 
         * @returns 
         */
        public onTopTouchTarget(data: HookMessage) {
            let pos = this.getTopTouchTargetPosition();
            if (pos == null) {
                return;
            }
            let msg: HookMessage = {
                id: HookMessageType.BUTTON_POS_TOP,
                rpc: data.rpc != null ? data.rpc : null,
                message: pos
            }
            HookWebClient.getInstance().sendMessage(msg);
        }
        /**
         * 获取随机触摸对象位置
         * @param data 
         * @returns 
         */
        public onRandTouchTarget(data: HookMessage) {
            let pos = this.getRandTouchTargetPosition();
            if (pos == null) {
                return;
            }
            let msg: HookMessage = {
                id: HookMessageType.BUTTON_POS_RAND,
                rpc: data.rpc != null ? data.rpc : null,
                message: pos
            }
            HookWebClient.getInstance().sendMessage(msg);
        }
        /**
         * 上报性能数据
         */
        public onReportPerformance() {
            let data = this.getPerformanceData();
            if (!data) {
                return;
            }
            let msg: HookMessage = {
                id: HookMessageType.PERFORMANCE,
                message: data
            }
            HookWebClient.getInstance().sendMessage(msg);
        }

        public onLogin(data: HookMessage) {
            this.loginConfig = data.message
            if (!this.loginConfig) {
                console.warn("登录配置为：", this.loginConfig);
                return;
            }
            let view = this.findView(this.loginConfig.loginClass);
            if (!view) {
                console.warn("找不到登录界面：", this.loginConfig.loginClass);
                return;
            }
            //填写账号
            if (this.loginConfig.loginAccountEdit && this.loginConfig.loginAccountEdit != "") {
                if (!this.hasProperty(view, this.loginConfig.loginAccountEdit)) {
                    console.warn("找不到账号输入框：", this.loginConfig.loginAccountEdit);
                    return;
                }
                view[this.loginConfig.loginAccountEdit].text = this.loginConfig.loginAccount;
                console.warn("填写账号：", view[this.loginConfig.loginAccountEdit].text);
            }
            //填写密码
            if (this.loginConfig.loginPasswordEdit && this.loginConfig.loginPasswordEdit != "") {
                if (!this.hasProperty(view, this.loginConfig.loginPasswordEdit)) {
                    console.warn("找不到密码输入框：", this.loginConfig.loginPasswordEdit);
                    return;
                }
                view[this.loginConfig.loginPasswordEdit].text = this.loginConfig.loginPassword;
            }

            //触发登录
            if (this.loginConfig.loginMethod && this.loginConfig.loginMethod != "") {
                if (!view[this.loginConfig.loginMethod]) {
                    console.warn("找不到登录方法：", this.loginConfig.loginMethod);
                    return;
                }
                let login: Function = view[this.loginConfig.loginMethod];
                login.call(view);
                let msg: HookMessage = {
                    id: HookMessageType.LOGIN_CONFIG,
                    rpc: data.rpc ? data.rpc : null,
                    message: "ok"
                }
                HookWebClient.getInstance().sendMessage(msg);
            }
        }

        /**
         * 自定义定时器事件
         * @returns 
         */
        public onCustomTimeEvent() {

        }
    }


    class HookWebClient {
        private static instance: HookWebClient = null;
        private _socket: WebSocket = null;
        private _callbacks: any = {};
        private _isConnected: boolean = false;
        private _initCallback: Function = null;
        private _isConnecting: boolean = false;
        private handle: any = null;
        private readonly REPORT_TIME = 1000;        //数据上报时间间隔

        private host: string = null;
        private port: number = null;

        public static getInstance() {
            if (!this.instance) {
                this.instance = new HookWebClient;
            }
            return this.instance;
        }

        public constructor() {
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
            }, this.REPORT_TIME);
        }

        private onTimeEvent() {
            if (!this.isConnected) {
                if (!this.isConnecting && this.host != null) {
                    this.connect(this.host, this.port);//重连
                }
                return;
            }
            if (HookEgretManager.getInstance().isInit()) {
                HookEgretManager.getInstance().addTouchPoint();
                HookEgretManager.getInstance().onReportPerformance();
                HookEgretManager.getInstance().onCustomTimeEvent();
            }
        }

        public connect(hostName: string, port: number): Promise<boolean> {
            this._isConnected = false;
            this._isConnecting = true;
            this.host = hostName;
            this.port = port;
            return this.initWebSocket(hostName, port);
        }

        private initWebSocket(host: string, port: number): Promise<boolean> {
            return new Promise((resolve, reject) => {
                try {
                    this._initCallback = (isConnect: boolean) => {
                        this._initCallback = null;
                        resolve(isConnect);
                    };
                    let url = '';
                    if (host.indexOf('ws') >= 0) {
                        url = host;
                    } else {
                        url = 'ws://' + host;
                    }
                    if (port) {
                        url += ':' + port;
                    }
                    let socket = new WebSocket(url);
                    socket.binaryType = 'arraybuffer';
                    socket.onopen = (event) => {
                        this._isConnecting = false;
                        if (this._initCallback) {
                            this._initCallback(true);
                        }
                        this.onConnect();
                    };
                    socket.onmessage = (event) => {
                        this.onMessage(event);
                    };
                    socket.onerror = (event) => {
                        this._isConnecting = false;
                        if (this._initCallback) {
                            this._initCallback(false);
                        }
                        this.onIOError(event);
                    };
                    socket.onclose = (event) => {
                        this._isConnecting = false;
                        if (this._initCallback) {
                            this._initCallback(false);
                        }
                        this.onClose(event);
                    };
                    this._socket = socket;
                } catch (error) {
                    reject(error);
                }
            });
        }

        public isConnecting() {
            return this._isConnecting;
        }

        public close() {
            if (this._socket) {
                this._socket.close();
            }
        }

        public send(data: ArrayBuffer) {
            if (this._socket) {
                this._socket.send(data);
            }
        }

        public sendMessage(obj: any) {
            if (this._socket) {
                this._socket.send(JSON.stringify(obj));
            }
        }

        public isConnected(): boolean {
            return this._isConnected;
        }

        private onConnect(): void {
            console.log("HookWebClient", "onConnect")
            this._isConnected = true;
        }

        private onMessage(event: MessageEvent): void {
            //console.log("HookWebClient", "onMessage");
            try {
                let json: HookMessage = JSON.parse(event.data);
                switch (json.id) {
                    case HookMessageType.BUTTON_POS_TOP:
                        HookEgretManager.getInstance().onTopTouchTarget(json);
                        break;
                    case HookMessageType.BUTTON_POS_RAND:
                        HookEgretManager.getInstance().onRandTouchTarget(json);
                        break;
                    case HookMessageType.LOGIN_CONFIG:
                        HookEgretManager.getInstance().onLogin(json);
                        break;
                }
            } catch (error) {

            }
        }

        private onClose(e: any): void {
            console.warn("HookWebClient", e)
            this._isConnected = false;
        }

        private onIOError(e: any): void {
            console.error("HookWebClient", e)
            this._isConnected = false;
        }
    }

    let json = JSON.parse(param);
    HookEgretManager.getInstance().isAddTouchPoint = json.touch;
    HookWebClient.getInstance().connect(json.host, json.port);
}