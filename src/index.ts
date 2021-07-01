import { Config } from "./config/Config";
import { EvaluateManager } from "./manager/EvaluateManager";
import { HttpManager } from "./manager/HttpManager";
import { ServerManager } from "./manager/ServerManager";


function main() {
    //启动HTTP服务
    HttpManager.getInstance().startServer()
    //启动服务器
    ServerManager.getInstance().startServer(Config.SERVER_PORT);
    //开始测试
    EvaluateManager.getInstance().startTest(Config.GAME_URL);
}

main();