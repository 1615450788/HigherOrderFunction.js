const { Queue } = require('./queue');

test('result', async () => {
  const fn = Queue((x) => {
    return new Promise(r => setTimeout(() => r(x), 100));
  }, { concurrency: 1 })
  let name = 1;
  expect(await fn(name)).toBeGreaterThanOrEqual(name);
  name++
  expect(await fn(name)).toBeGreaterThanOrEqual(name);

});

test('concurrency', async () => {
  const fn = Queue(() => {
    return new Promise(r => setTimeout(() => r(+new Date()), 100));
  }, { concurrency: 1 })

  const data = await Promise.all([fn(), fn(), fn()])
  expect(data[1] - data[0]).toBeGreaterThanOrEqual(100);
  expect(data[2] - data[1]).toBeGreaterThanOrEqual(100);
});

test('failAbort', async () => {
  let count = 0
  const fn = Queue(async (err) => {
    if (err) {
      throw new Error()
    }
    count++
    return new Promise(r => r(err))
  }, { failAbort: true, concurrency: 1 })

  await Promise.all([fn(0), fn(1)]).catch(e => e)
  expect(count).toBe(1);
  expect(await fn(0)).toBe(0);
  expect(count).toBe(2);
});

test('elastic', async () => {
  const fn = Queue((a) => {
    return new Promise(r => setTimeout(() => r(+new Date()), a ? 40 : 10));
  }, { concurrency: 2, elastic: { enable: true, idealDuration: 20 } })

  const data = await Promise.all([fn(), fn(), fn(), fn(), fn(), fn(true), fn(true), fn(true), fn(true)])
  expect(data[1] - data[0]).toBeGreaterThanOrEqual(10);
  expect(data[2] - data[1]).toBeLessThanOrEqual(5);
  expect(data[4] - data[3]).toBeLessThanOrEqual(5);
  expect(data[5] - data[4]).toBeGreaterThanOrEqual(40);
  expect(data[6] - data[5]).toBeLessThanOrEqual(5);
  expect(data[8] - data[7]).toBeGreaterThanOrEqual(40);
});








