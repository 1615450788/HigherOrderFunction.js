/**
 * 偏应用高阶函数，将函数入参拆分为多次传入
 * 第一个参数接收一个函数，剩余参数是第一个传入函数所需参数。剩余参数待传入的用undefined占位，执行偏应用函数时填充undefined
 * @param fn 需要拆分参数的函数
 * @param partialArgs 需要预传入的参数
 * @returns function 包装后的函数
 */
export const Partial = (fn, ...partialArgs) => {
  let args = partialArgs
  return (...fullArguments) => {
    let count = 0
    for (let i = 0; i < args.length && count < fullArguments.length; i++) {
      if (args[i] === undefined) {
        args[i] = fullArguments[count++]
      }
    }
    return fn.apply(null, args)
  }
}