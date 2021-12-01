const { cacheWarpper } = require('./cache');

test('number param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((a) => {
    count++
    return a + a
  }, {})
  expect(await fn(1)).toBe(2);
  expect(await fn(1)).toBe(2);
  expect(count).toBe(1);
});

test('boolean param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((a) => {
    count++
    return !a
  })
  expect(await fn(false)).toBe(true);
  expect(await fn(false)).toBe(true);
  expect(count).toBe(1);
});

test('string param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((a) => {
    count++
    return a + a
  })
  expect(await fn('1')).toBe('11');
  expect(await fn('1')).toBe('11');
  expect(count).toBe(1);
});

test('object param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((a) => {
    count++
    return a.a + a.a
  })
  expect(await fn({ a: 1 })).toBe(2);
  expect(await fn({ a: 1 })).toBe(2);
  expect(count).toBe(1);
});

test('array param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((a) => {
    count++
    return a[0] + a[0]
  })
  expect(await fn([1])).toBe(2);
  expect(await fn([1])).toBe(2);
  expect(count).toBe(1);
});

test('function param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((f) => {
    count++
    return f(1)
  })
  expect(await fn((a) => a + a)).toBe(2);
  expect(await fn((a) => a + a)).toBe(2);
  expect(count).toBe(1);
});

test('map param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((map) => {
    count++
    return map.get('a') + map.get('a');
  })
  const m = new Map();
  m.set('a', 1);
  expect(await fn(m)).toBe(2);
  expect(await fn(m)).toBe(2);
  expect(count).toBe(1);
});

test('set param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((set) => {
    count++
    return set.size + set.size
  })
  const s = new Set();
  s.add(1);
  const s2 = new Set();
  s2.add(1);
  expect(await fn(s)).toBe(2);
  expect(await fn(s2)).toBe(2);
  expect(count).toBe(1);
});

test('buffer param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((set) => {
    count++
    return set.length + set.length
  })
  const s = new Buffer.from([1]);
  const s2 = new Buffer.from([1]);
  expect(await fn(s)).toBe(2);
  expect(await fn(s2)).toBe(2);
  expect(count).toBe(1);
});

test('async function', async () => {
  let count = 0
  const fn = cacheWarpper(async (a) => {
    count++
    return new Promise(resolve => setTimeout(() => resolve(a + a)))
  })
  expect(await fn(1)).toBe(2);
  expect(await fn(1)).toBe(2);
  expect(await fn(1)).toBe(2)
  expect(count).toBe(1);
});


test('multiple param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((a, b) => {
    count++
    return a + b
  })
  expect(await fn(1, 2)).toBe(3);
  expect(await fn(1, 2)).toBe(3);
  expect(count).toBe(1);
});

test('complex param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((a) => {
    count++
    return a.a.a + a.a.b
  })
  expect(await fn({ a: { a: 1, b: 2 } })).toBe(3);
  expect(await fn({ a: { a: 1, b: 2 } })).toBe(3);
  expect(count).toBe(1);
});

test('complex param test cache', async () => {
  let count = 0
  const fn = cacheWarpper((a) => {
    count++
    return a.cb() + a.cb();
  })
  const cb = () => { return count };
  expect(await fn({ cb })).toBe(2);
  expect(await fn({ cb })).toBe(2);
  expect(cb()).toBe(1);
  expect(count).toBe(1);
});







