export namespace Config {
    //设计宽度
    export const DESIGN_WIDTH = 640;
    //设计高度
    export const DESIGN_HEIGHT = 1280;
    //使用宽度
    export const width = 320;
    //使用高度
    export const height = 640;

    //websocket地址
    export const SERVER_HOST = "127.0.0.1";
    //websocket端口
    export const SERVER_PORT = 5500;

    //http端口
    export const HTTP_PORT = 8080;

    //登录配置
    export const AUTO_LOGIN = false;                        //是否自动登录
    export const LOGIN_CLASS = "LoginSceneLayer";           //登录界面类名
    export const LOGIN_ACCOUNT = "1201";                    //账号
    export const LOGIN_PASSWORD = "";                       //密码
    export const LOGIN_ACCOUNTEDIT = "user";                //账号编辑框在类中的变量名
    export const LOGIN_PASSWORDEDIT = "pwd";                //密码编辑框在类中的变量名
    export const LOGIN_METHOD = "onClickStartBtn";          //登录按钮在类中的方法

    //是否显示页面点击位置
    export const SHOW_TOUCH_POINT = true;

    //开始测试延迟时间
    export const TIMER_INTERVAL_START = 200000;
    //每次定时器时间
    export const TIMER_INTERVAL_MIN = 200;
    //每次定时器时间
    export const TIMER_INTERVAL_MAX = 1000;

    //每次定时器循环次数
    export const FOR_COUNT_MIN = 20;
    //每次定时器循环次数
    export const FOR_COUNT_MAX = 60;

    //随机获取按钮点击最小次数
    export const RANDOM_GET_MIN = 2;
    //随机获取按钮点击最大次数
    export const RANDOM_GET_MAX = 5;
    //随机点击最小次数
    export const RANDOM_CLICK_MIN = 2;
    //随机点击最大次数
    export const RANDOM_CLICK_MAX = 5;
    //随机滚动最小次数
    export const RANDOM_SCROLL_MIN = 1;
    //随机滚动最大次数
    export const RANDOM_SCROLL_MAX = 3;

    //每次点击时间最小间隔(毫秒)
    export const CLICK_INTERVAL_TIME_MIN = 100;
    //每次点击时间最大间隔(毫秒)
    export const CLICK_INTERVAL_TIME_MAX = 300;

    //是否设置浏览器性能开关
    export const BROWSER_PER_OPEN = false;
    //网络延迟(ms)
    export const BROWSER_PER_LATENCY = 20;//20ms
    //下载速度
    export const BROWSER_PER_DOWNLOAD_THROUGHPUT = 780 * 1024 / 8;// 780 kb/s，下载速度
    //上传速度
    export const BROWSER_PER_UPLOAD_THROUGHPUT = 330 * 1024 / 8; // 330 kb/s，上传速度
    //CPU速率
    export const BROWSER_PER_CPU_THROTTLING_RATE = 5;

    //游戏地址
    export const GAME_URL = "http://127.0.0.1:3000/index.html";
    //export const GAME_URL = "http://127.0.0.1:3001";
    //export const GAME_URL = "http://fdd501.tpddns.cn:2333/chfs/shared/h5Demo6/";
}