/**
 * 性能统计
 */

export interface PerformanceData {
    //内存，GPU,加载资源数
    performance: {
        labels: Array<string>,
        memory: { total: number, count: number, min: number, max: number, data: Array<number> },
        gpu: { total: number, count: number, min: number, max: number, data: Array<number> },
        caches: { total: number, count: number, min: number, max: number, data: Array<number> },
        tween: { total: number, count: number, min: number, max: number, data: Array<number> },
    },
    network: {
        top: Array<{ time: number, url: string }>,   //耗时最长的资源
        last: Array<{ time: number, url: string }>,  //最新加载的资源
    }
}
export class PerformanceManager {
    private static instance: PerformanceManager;

    public static getInstance(): PerformanceManager {
        if (!this.instance) {
            this.instance = new PerformanceManager;
        }
        return this.instance;
    }

    private data: PerformanceData = {
        performance: {
            labels: [],
            memory: { total: 0, count: 0, min: 0, max: 0, data: [] },
            gpu: { total: 0, count: 0, min: 0, max: 0, data: [] },
            caches: { total: 0, count: 0, min: 0, max: 0, data: [] },
            tween: { total: 0, count: 0, min: 0, max: 0, data: [] },
        },
        network: {
            top: [],
            last: [],
        }
    };
    private requests: { [url: string]: number } = {};

    public addPerformanceData(tween: number, mem: number, gpu: number, caches: number) {
        if (this.data.performance.labels.length >= 10) {
            this.data.performance.labels.shift();
            this.data.performance.memory.data.shift();
            this.data.performance.gpu.data.shift();
            this.data.performance.caches.data.shift();
            this.data.performance.tween.data.shift();
        }
        this.data.performance.labels.push(this.getTime());
        this.data.performance.memory.data.push(mem);
        this.data.performance.gpu.data.push(gpu);
        this.data.performance.caches.data.push(caches);
        this.data.performance.tween.data.push(tween);
        //统计
        this.data.performance.memory.total += mem;
        this.data.performance.memory.count += 1;
        this.data.performance.memory.min = this.data.performance.memory.min > mem ? mem : this.data.performance.memory.min;
        this.data.performance.memory.max = this.data.performance.memory.max < mem ? mem : this.data.performance.memory.max;

        this.data.performance.gpu.total += gpu;
        this.data.performance.gpu.count += 1;
        this.data.performance.gpu.min = this.data.performance.gpu.min > gpu ? gpu : this.data.performance.gpu.min;
        this.data.performance.gpu.max = this.data.performance.gpu.max < gpu ? gpu : this.data.performance.gpu.max;

        this.data.performance.caches.total += caches;
        this.data.performance.caches.count += 1;
        this.data.performance.caches.min = this.data.performance.caches.min > caches ? caches : this.data.performance.caches.min;
        this.data.performance.caches.max = this.data.performance.caches.max < caches ? caches : this.data.performance.caches.max;

        this.data.performance.tween.total += tween;
        this.data.performance.tween.count += 1;
        this.data.performance.tween.min = this.data.performance.tween.min > tween ? tween : this.data.performance.tween.min;
        this.data.performance.tween.max = this.data.performance.tween.max < tween ? tween : this.data.performance.tween.max;
    }

    /**
     * 开始请求
     * @param url 
     */
    public onRequest(url: string) {
        //匹配文件
        let ext = [".json", ".png", ".jpg", ".js", ".atlas"]
        let match = false;
        for (let i = 0; i < ext.length; i++) {
            if (url.indexOf(ext[i]) >= 0) {
                match = true;
                break;
            }
        }
        if (!match) {
            return;
        }
        this.requests[url] = Date.now();
    }
    /**
     * 加载失败的链接
     * @param url 
     */
    public onRequestFailed(url: string) {
        if (this.requests[url]) {
            delete this.requests[url];
        }
    }
    /**
     * 加载完成的链接
     * @param url 
     * @returns 
     */
    public onRequestFinished(url: string) {
        if (!this.requests[url]) {
            return;
        }
        let time = Date.now() - this.requests[url];
        delete this.requests[url];
        let strs = url.split("/");
        this.data.network.top.push({ time: time, url: strs[strs.length - 1] });
        //this.data.network.push({ time: time, url: url });
        this.data.network.top.sort((a, b) => {
            return b.time - a.time;
        });

        //最后的
        this.data.network.last.push({ time: time, url: this.getTime() + "[" + strs[strs.length - 1] + "]" })

        if (this.data.network.top.length > 10) {
            this.data.network.top.pop();
        }
        if (this.data.network.last.length > 10) {
            this.data.network.last.shift();
        }
    }

    public toString(): string {
        return JSON.stringify(this.data);
    }

    public getTime(): string {
        let now = new Date();
        let yy = now.getFullYear(); //年
        let mm = now.getMonth() + 1; //月
        let dd = now.getDate(); //日
        let hh = now.getHours(); //时
        let ii = now.getMinutes(); //分
        let ss = now.getSeconds(); //秒
        // var time = yy + "-";
        // if (mm < 10) time += "0";
        // time += mm + "-";
        // if (dd < 10) time += "0";
        // time += dd + " ";
        // if (hh < 10) time += "0";
        let time = hh + ":";
        if (ii < 10) time += '0';
        time += ii + ":";
        if (ss < 10) time += '0';
        time += ss;

        //console.log(time); //获取当前日期 2019-04-17 10:27:27
        return time;
    }
}