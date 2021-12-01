import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./index.css";
import ReactDOM from "react-dom";
import { useEffect, useState } from 'react';
import { retryWarpper, queueWarpper, cacheWarpper } from '../src/index';
window.retryWarpper = retryWarpper;
window.queueWarpper = queueWarpper;
window.cacheWarpper = cacheWarpper;
function Retry() {
    const [count, setCount] = useState(0);
    const [value, setValue] = useState(0);
    useEffect(() => {
        const fn = retryWarpper(() => {
            const x = Math.random();
            setCount(d => d + 1);
            if (x > 0.9) {
                return x;
            }
            else {
                throw new Error();
            }
        }, { retries: 99, factor: 1, maxTimeout: 1000 });
        fn().then((d) => setValue(d));
    }, []);
    return _jsxs("div", { children: [_jsx("div", { children: `const fn = retryWarpper(() => {` }, void 0), _jsx("div", { children: `const x = Math.random();` }, void 0), _jsx("div", { children: `if(x > 0.9){return x}else{throw new Error()}` }, void 0), _jsx("div", { children: `}, { debug: true, retries: 99, factor: 1, maxTimeout: 1000 })` }, void 0), _jsx("div", { children: `console.log(await fn())` }, void 0), _jsxs("div", { children: ["\u91CD\u8BD5\u6B21\u6570:", count] }, void 0), _jsxs("div", { children: ["\u6267\u884C\u7ED3\u679C:", value || '执行中'] }, void 0)] }, void 0);
}
function Queue() {
    const [count, setCount] = useState(0);
    const [value, setValue] = useState([]);
    useEffect(() => {
        const startTime = +new Date();
        const fn = queueWarpper(() => {
            return new Promise(r => setTimeout(() => {
                setCount(d => d + 1);
                setValue(v => [...v, +new Date() - startTime]);
                r();
            }, 1000));
        }, { concurrency: 1 });
        Promise.all([fn(), fn(), fn(), fn()]);
    }, []);
    return _jsxs("div", { children: [_jsx("div", { children: `const originFn = ()=> new Promise(r => setTimeout(()=>{console.log('完成一个');r()},1000))` }, void 0), _jsx("div", { children: `const fn = queueWarpper(originFn,{ concurrency: 1 })` }, void 0), _jsx("div", { children: `fn();fn();fn();fn();` }, void 0), _jsxs("div", { children: ["\u5F53\u524D\u6267\u884C\u4EFB\u52A1\u7D22\u5F15:", count] }, void 0), _jsx("div", { children: "\u4EFB\u52A1\u5B8C\u6210\u65F6\u95F4:" }, void 0), value.map((v, k) => _jsxs("div", { children: [k + 1, ":", v] }, v))] }, void 0);
}
function Cache() {
    const [count, setCount] = useState(0);
    const [value, setValue] = useState(0);
    useEffect(() => {
        const fn = cacheWarpper((a, b) => {
            setCount(d => d + 1);
            return a + b;
        }, { concurrency: 1 });
        setInterval(() => {
            setValue(d => d + 1);
            fn(1, 2);
        }, 1000);
    }, []);
    return _jsxs("div", { children: [_jsx("div", { children: `const fn = cacheWarpper((a,b)=> {` }, void 0), _jsx("div", { children: `var x =a+b;console.log(x);return x})` }, void 0), _jsx("div", { children: `setInterval(() => fn(1, 2),1000)` }, void 0), _jsxs("div", { children: ["\u5B9E\u9645\u8FD0\u884C\u6B21\u6570:", count] }, void 0), _jsxs("div", { children: ["\u8C03\u7528\u6B21\u6570:", value] }, void 0)] }, void 0);
}
function App() {
    return _jsxs("div", { children: [_jsx("h1", { children: "high-order-function.js" }, void 0), _jsxs("div", { style: { display: 'flex', width: '100%', justifyContent: 'space-between' }, children: [_jsx(Retry, {}, void 0), _jsx(Queue, {}, void 0), _jsx(Cache, {}, void 0)] }, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("div", { children: "\u590D\u5236\u4EE3\u7801\u5230\u63A7\u5236\u53F0\u8BD5\u8BD5\uFF1FretryWarpper, queueWarpper, cacheWarpper " }, void 0)] }, void 0);
}
ReactDOM.render(_jsx(App, {}, void 0), document.getElementById("root"));
