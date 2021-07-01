declare class ViewManager {
    static instance: ViewManager;

    hideView(type: number): void
    jumpByAtom(atom: string, param?: any, isTip?: boolean): void;
    hideAllSubLayer();
    hidePopuLayer();
}

declare class UIBase {

    btnMgr: any
    uiType: any
    uiConfig: any
    validateNow()
    closeMyself()
}

declare namespace Maths {
    function randomInt(lower: number, upper: number): number
}

declare interface UIConfig {

    /**
     * ui类型
     */
    uiType: number,

    /**
     * 皮肤文件路径
     */
    exml: string,

    /**
     * 运行时的类名
     */
    runtime: typeof UIBase,

    /**
     * 页面所属层级
     */
    layerType: number,

    /**
     * 排序优先级
     */
    orderIdx: number,

    /**
     * 页面回收模式
     */
    uiRecoveryMode: any,

    /**
     * 排版配置
     */
    layoutConfig?: any,

    /**
     * 支持多个实体
     * @default false
     */
    multMode?: boolean

    /**
     * type名字
     */
    name?: string

    /**
     * UI父类型
     */
    parent?: number

    /**
     * 用于显示底部按钮变大判断
     */
    switchDir?: any
    /** 
     * 创建完成回调
    */
    createdComplete?: Function
    /**
     * 映射key（opencondition表中的atom） 
     */
    atom?: string;
    /**
     * 切换方向类型
     */
    switchType?: number;
    /**
     * 活动类型
     */
    promotionPageType?: number;

    /**
     * 子包编号 1开始
     */
    subPackIdx?: number;

    /**
     * 内容是否存在充值相关
     */
    hadRecharge?: boolean;
}

declare class GameTestManager {
    static get instance(): GameTestManager;

    openTest: boolean;
    topUIBase: Array<UIBase>;
    mainCityButton: Array<string>

    initMainCityButton();
    closeNoTestLayer();
    jumpAtom();
    getTopViewButtonPos();
    getRandViewButtonPos();
}

declare function newUIConfigList(): UIConfig[];