import { PuppeteerManager } from "./PuppeteerManager";
import Puppeteer = require('Puppeteer-core');
import { HookLoginConfig, HookMessage, HookMessageType, HookPerformanceData, ServerManager } from "./ServerManager";
import { LoggerManager, LoggerType } from "./LoggerManager";
import { Tools } from "../util/Tools";
import { Config } from "../config/Config";
import { HttpManager } from "./HttpManager";
import { PerformanceManager } from "./PerformanceManager";
export class EvaluateManager {
    private static instance: EvaluateManager;

    public static getInstance(): EvaluateManager {
        if (!this.instance) {
            this.instance = new EvaluateManager;
        }
        return this.instance;
    }

    private page: Puppeteer.Page = null;
    private isLogin: boolean = false;

    public async startTest(url: string) {
        this.page = await PuppeteerManager.getInstance().createPage(url);
        await this.page.waitForTimeout(2000);
        //设置低性能
        if (Config.BROWSER_PER_OPEN) {
            await PuppeteerManager.getInstance().setPagePerformance(this.page);
            await this.page.waitForTimeout(20000);
        }
        //添加客户端
        await PuppeteerManager.getInstance().addHookClient(this.page);

        setTimeout(() => {
            this.onTimerEvent();
        }, 30000)
    }

    private async onTimerEvent() {
        try {
            if (Config.AUTO_LOGIN && !this.isLogin) {
                await this.login();
                if (!this.isLogin) {
                    console.info("登录没有成功！继续尝试登录");
                    return;
                }
            }

            let count = Tools.randomInt(Config.FOR_COUNT_MIN, Config.FOR_COUNT_MAX);
            let num = 0;
            for (let i = 0; i < count; i++) {
                // await this.topClickButton();
                // await this.page.waitForTimeout(Tools.randomInt(Config.CLICK_INTERVAL_TIME_MIN, Config.CLICK_INTERVAL_TIME_MAX))

                num = Tools.randomInt(Config.RANDOM_GET_MIN, Config.RANDOM_GET_MAX);
                for (let k = 0; k < num; k++) {
                    await this.randClickButton();
                    await this.page.waitForTimeout(Tools.randomInt(Config.CLICK_INTERVAL_TIME_MIN, Config.CLICK_INTERVAL_TIME_MAX));
                }
                //随机点击
                num = Tools.randomInt(Config.RANDOM_CLICK_MIN, Config.RANDOM_CLICK_MAX);
                for (let k = 0; k < num; k++) {
                    await this.page.mouse.click(Tools.randomInt(0, Tools.width), Tools.randomInt(120, Tools.height), { delay: Tools.randomInt(5, 100) });
                    await this.page.waitForTimeout(Tools.randomInt(Config.CLICK_INTERVAL_TIME_MIN, Config.CLICK_INTERVAL_TIME_MAX));
                }
                //随机滑动
                num = Tools.randomInt(Config.RANDOM_SCROLL_MIN, Config.RANDOM_SCROLL_MAX);
                for (let k = 0; k < num; k++) {
                    await PuppeteerManager.getInstance().randomLeftRightMove(this.page);
                    await this.page.waitForTimeout(Tools.randomInt(Config.CLICK_INTERVAL_TIME_MIN, Config.CLICK_INTERVAL_TIME_MAX));
                    await PuppeteerManager.getInstance().randomUpDownMove(this.page);
                    await this.page.waitForTimeout(Tools.randomInt(Config.CLICK_INTERVAL_TIME_MIN, Config.CLICK_INTERVAL_TIME_MAX));
                }

                await this.page.waitForTimeout(Tools.randomInt(Config.CLICK_INTERVAL_TIME_MIN, Config.CLICK_INTERVAL_TIME_MAX))
            }
        } finally {
            setTimeout(() => {
                this.onTimerEvent();
            }, Tools.randomInt(Config.TIMER_INTERVAL_MIN, Config.TIMER_INTERVAL_MAX))
        }
    }

    /**
     * 接收客户端消息
     * @param data 
     */
    public onMessage(data: HookMessage) {
        switch (data.id) {
            case HookMessageType.PERFORMANCE:
                this.onPerformance(data.message);
                break;
        }
    }

    private async onPerformance(data: HookPerformanceData) {
        if (!this.page) {
            return;
        }
        const metrics = await this.page.metrics();
        LoggerManager.getInstance().printString(LoggerType.performance, "");
        LoggerManager.getInstance().printString(LoggerType.performance, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>页面性能>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        LoggerManager.getInstance().printString(LoggerType.performance, "           Timestamp:", metrics.Timestamp);                                       //调用metrics方法时间戳
        LoggerManager.getInstance().printString(LoggerType.performance, "           Documents:", metrics.Documents);                                       //文档数量
        LoggerManager.getInstance().printString(LoggerType.performance, "              Frames:", metrics.Frames);                                          //frame数量
        LoggerManager.getInstance().printString(LoggerType.performance, "    JSEventListeners:", metrics.JSEventListeners);                                //事件的数量
        LoggerManager.getInstance().printString(LoggerType.performance, "               Nodes:", metrics.Nodes);                                           //DOM元素的数量
        LoggerManager.getInstance().printString(LoggerType.performance, "         LayoutCount:", metrics.LayoutCount);                                     //页面布局的数量
        LoggerManager.getInstance().printString(LoggerType.performance, "    RecalcStyleCount:", metrics.RecalcStyleCount);                                //页面样式重新计算的次数
        LoggerManager.getInstance().printString(LoggerType.performance, "      LayoutDuration:", metrics.LayoutDuration);                                  //所有页面布局的总持续时间
        LoggerManager.getInstance().printString(LoggerType.performance, " RecalcStyleDuration:", metrics.RecalcStyleDuration);                             //所有页面样式重新计算的总持续时间
        LoggerManager.getInstance().printString(LoggerType.performance, "      ScriptDuration:", metrics.ScriptDuration);                                  //JavaScript执行的总时间
        LoggerManager.getInstance().printString(LoggerType.performance, "        TaskDuration:", metrics.TaskDuration);                                    //浏览器执行的所有任务的总持续时间
        LoggerManager.getInstance().printString(LoggerType.performance, "      JSHeapUsedSize:", Math.floor(metrics.JSHeapUsedSize / 1024 / 1024) + "MB");        //JavaScript实际内存使用情况
        LoggerManager.getInstance().printString(LoggerType.performance, "     JSHeapTotalSize:", Math.floor(metrics.JSHeapTotalSize / 1024 / 1024) + "MB");       //JavaScript使用的内存总量，包括空闲分配的空间
        //LoggerManager.getInstance().printString(LoggerType.performance, "    JSEventListeners:", metrics.JSEventListeners);
        LoggerManager.getInstance().printString(LoggerType.performance, "           cachesRes:", data.caches);
        LoggerManager.getInstance().printString(LoggerType.performance, "             gpuSize:", data.gpuSize + "kb");
        LoggerManager.getInstance().printString(LoggerType.performance, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<页面性能<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

        let tween = data.tween;
        let mem = Number((metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2));
        let gpu = Number((data.gpuSize / 1024).toFixed(2));
        let caches = data.caches;
        PerformanceManager.getInstance().addPerformanceData(tween, mem, gpu, caches);


    }

    private async login() {
        let fun = async (): Promise<any> => {
            return new Promise((resolve, reject) => {
                let data: HookLoginConfig = {
                    loginClass: Config.LOGIN_CLASS,         //登录界面类名
                    loginAccount: Config.LOGIN_ACCOUNT,       //账号
                    loginPassword: Config.LOGIN_PASSWORD,      //密码
                    loginAccountEdit: Config.LOGIN_ACCOUNTEDIT,   //账号编辑框在类中的变量名
                    loginPasswordEdit: Config.LOGIN_PASSWORDEDIT,  //密码编辑框在类中的变量名
                    loginMethod: Config.LOGIN_METHOD,        //登录按钮在类中的变量名
                }
                ServerManager.getInstance().request(HookMessageType.LOGIN_CONFIG, data, (data: HookMessage) => {
                    if (data == null) {
                        resolve(null);
                        return;
                    }
                    resolve(data.message);
                })
            })
        }
        let res = await fun();

        if (res) {
            this.isLogin = true;
        }
    }

    private async topClickButton() {
        let fun = async (): Promise<any> => {
            return new Promise((resolve, reject) => {
                ServerManager.getInstance().request(HookMessageType.BUTTON_POS_TOP, null, (data: HookMessage) => {
                    if (data == null) {
                        resolve(null);
                        return;
                    }
                    resolve({ x: data.message.x, y: data.message.y });
                })
            })
        }
        let pos = await fun();

        if (pos) {
            pos.x *= (Tools.width / Tools.DESIGN_WIDTH);
            pos.y *= (Tools.height / Tools.DESIGN_HEIGHT);
            await this.page.mouse.click(pos.x, pos.y, { delay: Tools.randomInt(5, 100) });
        }
    }

    private async randClickButton() {
        let fun = async (): Promise<any> => {
            return new Promise((resolve, reject) => {
                ServerManager.getInstance().request(HookMessageType.BUTTON_POS_RAND, null, (data: HookMessage) => {
                    if (data == null) {
                        resolve(null);
                        return;
                    }
                    resolve({ x: data.message.x, y: data.message.y });
                })
            })
        }
        let pos = await fun();

        if (pos) {
            pos.x *= (Tools.width / Tools.DESIGN_WIDTH);
            pos.y *= (Tools.height / Tools.DESIGN_HEIGHT);
            await this.page.mouse.click(pos.x, pos.y, { delay: Tools.randomInt(5, 100) });
        }
    }
}