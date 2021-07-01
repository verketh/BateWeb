

const log4js = require('log4js');

log4js.configure({
    appenders: {
        console: { type: 'console', level: 'warn' },
        all: { type: 'file', filename: __dirname + '/../../logs/all.log' },
        everything: { type: 'multiFile', base: __dirname + '/../../logs/', property: 'prop', extension: '.log' }
    },
    categories: { default: { appenders: ['everything', 'console', 'all'], level: 'debug' } }
});

export enum LoggerType {
    everything,         //所有日志
    performance,        //性能统计日志
    pageerror,          //页面错误日志
    requestfailed,      //加载失败日志
}

export class LoggerManager {
    private static instance: LoggerManager;

    public static getInstance(): LoggerManager {
        if (!this.instance) {
            this.instance = new LoggerManager;
        }
        return this.instance;
    }

    private logger: any = null;
    constructor() {
        this.logger = log4js.getLogger("prop");
    }


    public error(type: LoggerType, ...msgs) {
        switch (type) {
            case LoggerType.performance:
                this.logger.addContext('prop', "performance");
                this.logger.error(msgs);
                break;
            case LoggerType.pageerror:
                this.logger.addContext('prop', "pageerror");
                this.logger.error(msgs);
                break;
            case LoggerType.requestfailed:
                this.logger.addContext('prop', "requestfailed");
                this.logger.error(msgs);
                break;
            default:
                this.logger.addContext('prop', "all");
                this.logger.error(msgs);
        }
    }

    public log(type: LoggerType, ...msgs) {
        switch (type) {
            case LoggerType.performance:
                this.logger.addContext('prop', "performance");
                this.logger.log(msgs);
                break;
            case LoggerType.pageerror:
                this.logger.addContext('prop', "pageerror");
                this.logger.log(msgs);
                break;
            case LoggerType.requestfailed:
                this.logger.addContext('prop', "requestfailed");
                this.logger.log(msgs);
                break;
            default:
                this.logger.addContext('prop', "all");
                this.logger.log(msgs);
        }
    }

    public warn(type: LoggerType, ...msgs) {
        switch (type) {
            case LoggerType.performance:
                this.logger.addContext('prop', "performance");
                this.logger.warn(msgs);
                break;
            case LoggerType.pageerror:
                this.logger.addContext('prop', "pageerror");
                this.logger.warn(msgs);
                break;
            case LoggerType.requestfailed:
                this.logger.addContext('prop', "requestfailed");
                this.logger.warn(msgs);
                break;
            default:
                this.logger.addContext('prop', "all");
                this.logger.warn(msgs);
        }
    }

    public info(type: LoggerType, ...msgs) {
        switch (type) {
            case LoggerType.performance:
                this.logger.addContext('prop', "performance");
                this.logger.info(msgs);
                break;
            case LoggerType.pageerror:
                this.logger.addContext('prop', "pageerror");
                this.logger.info(msgs);
                break;
            case LoggerType.requestfailed:
                this.logger.addContext('prop', "requestfailed");
                this.logger.info(msgs);
                break;
            default:
                this.logger.addContext('prop', "all");
                this.logger.info(msgs);
        }
    }

    public printString(type: LoggerType, ...msgs) {
        let str = "";
        for (let i = 0; i < msgs.length; i++) {
            str += msgs[i];
        }
        switch (type) {
            case LoggerType.performance:
                this.logger.addContext('prop', "performance");
                this.logger.info(str);
                break;
            case LoggerType.pageerror:
                this.logger.addContext('prop', "pageerror");
                this.logger.info(str);
                break;
            case LoggerType.requestfailed:
                this.logger.addContext('prop', "requestfailed");
                this.logger.info(str);
                break;
            default:
                this.logger.addContext('prop', "all");
                this.logger.info(str);
        }
    }
}