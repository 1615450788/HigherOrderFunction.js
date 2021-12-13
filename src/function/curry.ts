// 柯里化函数
export const Curry = (fn) => {
  if (typeof fn !== 'function') {
    throw Error('No function provided')
  }

  return function curriedFn(...args) {
    if (fn.length > args.length) {  // 未达到触发条件，继续收集参数
      return function () {
        return curriedFn.apply(null, args.concat([].slice.call(arguments)))
      }
    }
    return fn.apply(null, args)
  }
}