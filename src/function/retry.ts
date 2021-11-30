import retry from 'retry';

/**
 * 重试高阶函数
 * @param cb 需要重试的函数
 * @param options 重试配置，如重试几次
 * @returns cb的执行结果，除重试全部失败，抛出错误外，均返回成功数据
 */
export function retryWarpper(cb: () => Promise<any>, options = { retries: 2 }) {
  var operation = retry.operation(options);
  return new Promise((resolve, reject) => {
    operation.attempt(async () => {
      try {
        const attempts = operation.attempts();
        if (attempts > 1) {
          console.log('任务执行失败，正在重试，当前重试次数:', attempts - 1, '; 最大重试次数：', options.retries);
        }
        const result = await cb();
        resolve(result);
      } catch (error) {
        if (operation.retry(error as any)) {
          return;
        }
        reject(operation.errors());
      }
    });
  });
}