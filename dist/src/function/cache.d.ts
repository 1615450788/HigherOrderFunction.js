/**
 * 缓存配置
 */
interface IOptions {
    /**
     * 筛选需要进行缓存key运算的参数，默认为全部入参;
     * @default (...arg) => arg;
     * @param {Array} arg:调用 fn 的参数数组；
     * @returns {any} 进行缓存key运算的数据;
     */
    params?: (...arg: any[]) => any[];
    /**
     * 定义缓存key运算的方式，默认使用object-hash运算，优先级高于hashOptions；
     * @default (...arg) => hash(arg, hashOptions);
     * @param {Array} arg:调用 fn 的参数数组；
     * @returns {String} 缓存key;
     */
    key?: (...arg: any[]) => string;
    /**
     * 自定义缓存的存储方式
     */
    storage?: {
        set: (key: string, value: any) => any;
        get: (key: string) => any;
    };
    /**
     * 是否开启调试日志
     * @default false
     */
    debug?: boolean;
    /**
     * 需要透传给object-hash的配置，用于精确控制hash的生成，例如数组和散列是否排序后计算hash
     * @see https://www.npmjs.com/package/object-hash/v/2.2.0
     */
    hashOptions?: Object;
}
/**
 * 缓存高阶函数，默认使用入参hash值作为缓存key，可通过options配置自定义，
 * 复杂类型入参将会用属性或值进行hash运算，如function、map、set、buffer、array、object；
 * 散列类型数据会排序后再进行hash计算，如map、object
 * @example
 * const fn = Cache((a) => a + a);
 * (await fn(1)) === 2;
 * @param {Async Function} fn 需要使用缓存的函数
 * @param {Object} options 缓存配置
 * @returns
 */
export declare const Cache: (fn: Function, options?: IOptions | undefined) => (...arg: any[]) => Promise<any>;
export {};
