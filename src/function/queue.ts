import { clamp, inRange } from 'lodash';
import Queue from 'queue';
// const Queue = require('queue');


/**
 * 队列执行高阶函数，支持弹性并发（按照：根据运算时间进行优化）；
 * @param fn 需要队列执行的函数
 * @param options 队列配置
 * @param options.concurrency 队列任务并发限制，TODO
 * @param options.idealDuration 队列任务的理想执行耗时，用于计算弹性并发策略
 * @returns 包装后的队列函数，再次调用后插入队列
 */
export const queueWarpper = (
  fn:Function,
  options: { concurrency: number; idealDuration: number; failAbort: boolean } = {
    concurrency: 1,
    idealDuration: 10 * 1000,
    failAbort: true,
  },
) => {
  const { idealDuration, failAbort } = options;
  const queueIns = new Queue({ concurrency: 1, autostart: true });

  // 开始任务时，添加执行环境信息，用于后续的并发伸缩计算
  queueIns.on('start', (job) => {
    job._startTime = Number(new Date());
    job._concurrency = queueIns.concurrency;
  });

  // 每个任务完成时进行弹性并发判断
  queueIns.on('success', (result, job) => {
    // 并发数变更前的任务，缺乏准确性，不进行伸缩计算
    if (job._concurrency !== queueIns.concurrency) return;
    const duration = Number(new Date()) - job._startTime;
    let concurrency: number = queueIns.concurrency;
    // 期望值上下50%为合理波动范围，不进行并发数的伸缩
    if (inRange(duration, idealDuration * 0.9, idealDuration * 1.1)) return;
    if (duration < idealDuration) {
      concurrency++;
    } else {
      concurrency--;
    }
    concurrency = clamp(concurrency, 1, 6);
    if (queueIns.concurrency !== concurrency) {
      queueIns.concurrency = concurrency;
    }
    console.log('queueWarpper success', { duration, start: job._startTime, concurrency });
  });

  let errorHandler = () => {};
  // 根据配置添加失败中止逻辑，（queue的error事件太过滞后，无法在任务失败时准确执行）
  if (failAbort) {
    errorHandler = () => {
      console.log('queueIns errorHandler', queueIns);
      queueIns.end();
    };
  }

  queueIns.start();
  return (...arg: any) => {
    return new Promise((resolve, reject) => {
      queueIns.push(async () => {
        return fn(...arg)
          .then(resolve)
          .catch((err:Error) => {
            errorHandler();
            reject(err);
          });
      });
    });
  };
};