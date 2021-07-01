import { HookWebClientFun } from "../client/HookWebClient";
import { Tools } from "../util/Tools";
import { LoggerManager, LoggerType } from "./LoggerManager";

import Puppeteer = require('Puppeteer-core');
import { Config } from "../config/Config";
import { PerformanceManager } from "./PerformanceManager";
export class PuppeteerManager {
    private static instance: PuppeteerManager;

    public static getInstance(): PuppeteerManager {
        if (!this.instance) {
            this.instance = new PuppeteerManager;
        }
        return this.instance;
    }

    /**
     * 创建browser和page
     * @returns page
     */
    public async createPage(url: string): Promise<Puppeteer.Page> {
        const browser: Puppeteer.Browser = await Puppeteer.launch({
            headless: false,
            devtools: true,
            executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
        });
        const page = await browser.newPage();
        //开启请求拦截
        await page.setRequestInterception(true);
        //设置页面大小
        await page.setViewport({
            width: Tools.width,
            height: Tools.height,
        })
        //监听页面错误
        page.on('pageerror', pageerr => {
            console.error(pageerr);
            LoggerManager.getInstance().error(LoggerType.pageerror, pageerr);
        });
        // //页面请求
        page.on('request', request => {
            try {
                PerformanceManager.getInstance().onRequest(request.url());
            } catch (error) {
                console.error(error);
            }
            request.continue();
        });
        //监听加载失败的url
        page.on('requestfailed', request => {
            PerformanceManager.getInstance().onRequestFailed(request.url());
            LoggerManager.getInstance().error(LoggerType.requestfailed, request.url());
        });
        //页面请求完成
        page.on('requestfinished', request => {
            try {
                PerformanceManager.getInstance().onRequestFinished(request.url());
            } catch (error) {
                console.error(error);
            }
        });
        //跳转页面
        await page.goto(url, { timeout: 1000000 });
        return page;
    }

    /**
     * 设置页面性能
     * @param page 
     */
    public async setPagePerformance(page: Puppeteer.Page): Promise<void> {
        //设置设备性能
        await (page as any)._client.send('Network.emulateNetworkConditions', { // 3G Slow
            offline: false,
            latency: Config.BROWSER_PER_LATENCY, // ms,网络延迟
            downloadThroughput: Config.BROWSER_PER_DOWNLOAD_THROUGHPUT, // kb/s，下载速度
            uploadThroughput: Config.BROWSER_PER_UPLOAD_THROUGHPUT, // kb/s，上传速度
        });
        await (page as any)._client.send('Emulation.setCPUThrottlingRate', { rate: Config.BROWSER_PER_CPU_THROTTLING_RATE });
    }


    public async evaluate(page: Puppeteer.Page, execute: (arg: any) => Promise<any>, args?: any,): Promise<any> {
        //该方法会导致page泄漏内存
        if (args) {
            return await page.evaluate(execute, args);
        } else {
            return await page.evaluate(execute);
        }
    }

    /**
     * 鼠标点击
     * @param x 
     * @param y 
     * @param delay 
     */
    public async onMouseClick(page: Puppeteer.Page, x: number, y: number, delay: number) {
        await page.mouse.click(x, y, { delay: Tools.randomInt(5, 100) });
    }

    /**
     * 随机左右滑动
     */
    public async randomLeftRightMove(page: Puppeteer.Page): Promise<void> {
        //左右滑动
        let y = Tools.randomInt(100, Tools.height - 100)
        await page.mouse.move(Tools.randomInt(10, Tools.width - 10), y);
        await page.mouse.down()
        await page.mouse.move(Tools.randomInt(10, Tools.width - 10), y);
        await page.mouse.up()
    }

    /**
     * 随机上下滑动
     */
    public async randomUpDownMove(page: Puppeteer.Page): Promise<void> {
        //左右滑动
        let x = Tools.randomInt(50, Tools.width - 50)
        await page.mouse.move(x, Tools.randomInt(100, Tools.height - 100));
        await page.mouse.down()
        await page.mouse.move(x, Tools.randomInt(100, Tools.height - 100));
        await page.mouse.up()
    }

    /**
     * 打印页面性能
     * @param page 
     */
    public async printPerformanceStart(page: Puppeteer.Page): Promise<void> {
        const metrics = await page.metrics();
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

    }

    public async printPerformanceEnd(page: Puppeteer.Page): Promise<void> {
        LoggerManager.getInstance().printString(LoggerType.performance, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<页面性能<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    }

    public async addHookClient(page: Puppeteer.Page) {
        let params = {
            host: Config.SERVER_HOST,
            port: Config.SERVER_PORT,
            touch: Config.SHOW_TOUCH_POINT,
        }
        await page.evaluate(HookWebClientFun, JSON.stringify(params));
    }
}