# High Order  Function

Higher order function library

[demo](https://1615450788.github.io/HigherOrderFunction.js/)

```
npm i high-order-function
```

```javascript
import { retryWarpper, queueWarpper, cacheWarpper } from 'high-order-function'

const fn = retryWarpper(() => {
   if(Math.random()>0.5){
      throw New Error()
   }else{
      return 1
   }
});
(await fn()) === 1;

const fn = cacheWarpper((a) => a + a);
(await fn(1)) === 2;

const fn = queueWarpper((a) => new Promise(r=>setTimeout(r,1000)),{concurrency:1});
fn() // delay 1s
fn() // delay 2s
```

