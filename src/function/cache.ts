import { isArray, isBuffer, isFunction, isObject, isString } from 'lodash';
import md5 from 'md5';
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
  params?: (...arg: any[]) => any;
  /**
   * 定义缓存key运算的方式，默认使用md5运算；
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
}

/**
 * 缓存高阶函数，默认使用入参hash值作为缓存key
 * 复杂类型入参将会用属性或值进行hash运算，如function、map、set、buffer、array、object；
 * @example
 * const fn = Cache((a) => a + a);
 * (await fn(1)) === 2;
 * @param {Async Function} fn 需要使用缓存的函数
 * @param {Object} options 缓存配置
 * @returns
 */
export const Cache = (fn: Function, options?: IOptions) => {
  const {
    params = (...arg: any[]) => arg,
    key = (...arg: any[]) => newMD5(...arg),
    storage = new Map(),
    debug = false,
  } = options || {};
  return async (...arg: any[]) => {
    const cacheKey: string = await key(...(await params(...arg)));
    const cacheValue = await storage.get(cacheKey);
    if (cacheValue) {
      debug && console.log("Cache found", { cacheKey, cacheValue });
      return cacheValue;
    } else {
      debug && console.log("Cache not found", { cacheKey });
      const result = await fn(...arg);
      await storage.set(cacheKey, result);
      return result;
    }
  };
};

async function newMD5(...arg){
  const argHash = await Promise.all(
    arg.map(async (v) => {
      if (isBuffer(v) || isArray(v) || isString(v)) {
        return md5(v);
      } else if (v.arrayBuffer) {
        return md5(Buffer.from(await v.arrayBuffer()));
      } else if (isFunction(v)) {
        return md5(v.toString());
      } else if (isObject(v)) {
        return md5(JSON.stringify(v));
      }
    }),
  );
  return md5(argHash);
}
