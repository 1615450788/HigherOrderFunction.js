/**
 * 重试配置
 * 更多需要透传给retry的配置
 * @see https://www.npmjs.com/package/retry
 */
interface IOptions {
    /**
     * 是否开启调试日志
     * @default false
     */
    debug?: boolean;
    /**
     * 重试次数
     * @default 2 俗话说，事不过三
     */
    retries?: number;
    /**
     * 更多需要透传给retry的配置
     * @see https://www.npmjs.com/package/retry
     */
    [key: string]: any;
}
/**
 * 重试高阶函数
 * @example
 * const fn = retryWarpper(() => {
 *  if(Math.random()>0.5){
 *    throw New Error()
 *  }else{
 *    return 1
 *  }
 * });
 * (await fn()) === 1;
 * @param cb 需要重试的函数
 * @param options 重试配置
 * @returns 包装后的重试函数，只要重试成功，就不会报错
 */
export declare function retryWarpper(cb: (...arg: any) => any, options?: IOptions): (...arg: any[]) => Promise<any>;
export {};
