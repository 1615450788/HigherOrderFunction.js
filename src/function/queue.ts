import { clamp, inRange } from "lodash";
import originQueue from "../common/queue";

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
 * const fn = Queue((a) => new Promise(r=>setTimeout(r,1000)),{concurrency:1});
 * fn() // delay 1s
 * fn() // delay 1s
 * @param fn 需要队列执行的函数
 * @param options 队列配置
 * @returns 包装后的队列函数，再次调用后插入队列自动执行
 */
export const Queue = (fn: Function, options?: IOptions) => {
  const {
    concurrency = 6,
    failAbort = true,
    debug = false,
    elastic: { enable = false, idealDuration = 10000 } = {},
  } = options || {};
  const startConcurrency = enable ? 1 : concurrency;
  const queueIns = new (originQueue as any)({
    concurrency: startConcurrency,
    autostart: true,
  });

  if (enable && concurrency > 1) {
    // 开始任务时，添加执行环境信息，用于后续的并发伸缩计算
    queueIns.on("start", job => {
      job._startTime = Number(new Date());
      job._concurrency = queueIns.concurrency;
    });

    // 每个任务完成时进行弹性并发判断
    queueIns.on("success", (result, job) => {
      // 并发数变更前的任务，缺乏准确性，不进行伸缩计算
      if (job._concurrency !== queueIns.concurrency) return;
      const duration = Number(new Date()) - job._startTime;
      let nowConcurrency: number = queueIns.concurrency;
      // 期望值上下10%为合理波动范围，不进行伸缩
      if (inRange(duration, idealDuration * 0.9, idealDuration * 1.1)) return;
      if (duration < idealDuration) {
        nowConcurrency++;
      } else {
        nowConcurrency--;
      }
      nowConcurrency = clamp(nowConcurrency, 1, concurrency);
      if (queueIns.concurrency !== nowConcurrency) {
        queueIns.concurrency = nowConcurrency;
      }
      debug &&
        console.log("Queue success", {
          duration,
          start: job._startTime,
          nowConcurrency,
        });
    });
  }

  let errorHandler = () => { };
  // 根据配置添加失败中止逻辑，（queue的error事件太过滞后，无法在任务失败之前执行）
  if (failAbort) {
    errorHandler = () => {
      debug && console.log("Queue error", queueIns);
      queueIns.end();
    };
  }

  queueIns.start();
  return (...arg: any) => {
    return new Promise((resolve, reject) => {
      queueIns.push(async () => {
        try {
          const result = await fn(...arg);
          resolve(result);
        } catch (err) {
          errorHandler();
          reject(err);
        }
      });
    });
  };
};
