import Express = require('express'); //1
import { Config } from '../config/Config';
import { PerformanceManager } from './PerformanceManager';

export class HttpManager {

    private static instance: HttpManager;

    public static getInstance(): HttpManager {
        if (!this.instance) {
            this.instance = new HttpManager;
        }
        return this.instance;
    }

    private app = null;
    private data = {
        labels: [],
        datasets: [{
            label: '内存(MB)',
            data: [],
        },
        {
            label: 'GPU(MB)',
            data: [],
        },
        {
            label: '缓存资源数',
            data: [],
        }
        ]
    };
    constructor() {

    }

    public startServer() {
        if (this.app) {
            return;
        }
        this.app = Express();
        console.warn(__dirname + '/../../src/web');
        this.app.use(Express.static(__dirname + '/../../src/web'));
        this.app.get('/data/', (req, res) => {
            this.onRequestData(req, res)
        })
        this.app.listen(Config.HTTP_PORT);
    }

    private onRequestData(req, res) {
        res.send(PerformanceManager.getInstance().toString());
    }

}