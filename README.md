# High Order Function

Higher order function library

[demo](https://1615450788.github.io/HigherOrderFunction.js/)

```
npm i high-order-function
```

```javascript
import HOF from 'high-order-function'

const fn = HOF.Retry(() => {
   if(Math.random()>0.5){
      throw New Error()
   }else{
      return 1
   }
});
(await fn()) === 1;

const fn = HOF.Cache((a) => a + a);
(await fn(1)) === 2;

const fn = HOF.QueueW((a) => new Promise(r=>setTimeout(r,1000)),{concurrency:1});
fn() // delay 1s
fn() // delay 2s
```

