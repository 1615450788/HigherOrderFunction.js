import "./index.css";
import ReactDOM from "react-dom";
import { useEffect, useState } from 'react';
import HOF from 'high-order-function'

window.HOF=HOF;

function Retry() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const fn = HOF.Retry(() => {
      const x = Math.random();
      setCount(d => d + 1)
      if (x > 0.9) {
        return x
      } else {
        throw new Error();
      }
    }, { retries: 99, factor: 1, maxTimeout: 1000 })
    fn().then((d) => setValue(d));
  }, [])
  return <div>
    <h2>Retry</h2>
    <div>{`const fn = Retry(() => {`}</div>
    <div>{`const x = Math.random();`}</div>
    <div>{`if(x > 0.9){return x}else{throw new Error()}`}</div>
    <div>{`}, { debug: true, retries: 99, factor: 1, maxTimeout: 1000 })`}</div>
    <div>{`console.log(await fn())`}</div>
    <div>重试次数:{count}</div>
    <div>执行结果:{value || '执行中'}</div>
  </div>
}

function Queue() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState<number[]>([]);
  useEffect(() => {
    const startTime = +new Date();
    const fn = HOF.Queue(() => {
      return new Promise(r => setTimeout(() => {
        setCount(d => d + 1)
        setValue(v => [...v, +new Date() - startTime]);
        r()
      }, 1000))
    }, { concurrency: 1 })
    Promise.all([fn(), fn(), fn(), fn()])
  }, [])
  return <div>
    <h2>Queue</h2>
    <div>{`const originFn = ()=> new Promise(r => setTimeout(()=>{console.log('完成一个');r()},1000))`}</div>
    <div>{`const fn = Queue(originFn,{ concurrency: 1 })`}</div>
    <div>{`fn();fn();fn();fn();`}</div>
    <div>当前执行任务索引:{count}</div>
    <div>任务完成时间:</div>
    {value.map((v, k) => <div key={v}>{k + 1}:{v}</div>)}
  </div>
}

function Cache() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const fn = HOF.Cache((a, b) => {
      setCount(d => d + 1)
      return a + b
    }, { concurrency: 1 })
    setInterval(() => {
      setValue(d => d + 1)
      fn(1, 2);
    }, 1000)
  }, [])
  return <div>
    <h2>Cache</h2>
    <div>{`const fn = Cache((a,b)=> {`}</div>
    <div>{`var x =a+b;console.log(x);return x})`}</div>
    <div>{`setInterval(() => fn(1, 2),1000)`}</div>
    <div>实际运行次数:{count}</div>
    <div>调用次数:{value}</div>
  </div>
}

function App() {
  return <div>
    <h1>high-order-function.js</h1>
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
      <Retry />
      <Queue />
      <Cache />
    </div>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <div>复制代码到控制台试试？window.HOF </div>
  </div>

}

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
