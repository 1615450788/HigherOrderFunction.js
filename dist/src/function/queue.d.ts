interface IOptions {
    /**
     * 队列任务并发限制
     * @default 6
     */
    concurrency?: number;
    /**
     * 队列的异常处理方式，发生异常是否终止队列
     * @default false
     */
    failAbort?: boolean;
    /**
     * 弹性并发配置，目的是为了不同的执行环境下，能够根据任务的执行耗时，动态调整并发数，从而将单个任务的执行耗时控制在接受范围内。
     * @default undefined
     */
    elastic?: {
        /**
         * 是否开启弹性执行
         * @default false
         */
        enable?: boolean;
        /**
         * 队列任务的理想执行耗时(ms)，用于计算弹性并发策略
         * @default 10000
         */
        idealDuration?: number;
    };
    /**
     * 是否打印调试信息
     * @default false
     */
    debug?: boolean;
}
/**
 * 队列执行高阶函数，支持弹性并发
 * @example
 * const fn = queueWarpper((a) => new Promise(r=>setTimeout(r,1000)),{concurrency:1});
 * fn() // delay 1s
 * fn() // delay 1s
 * @param fn 需要队列执行的函数
 * @param options 队列配置
 * @returns 包装后的队列函数，再次调用后插入队列自动执行
 */
export declare const queueWarpper: (fn: Function, options?: IOptions | undefined) => (...arg: any) => Promise<unknown>;
export {};
