const { Queue } = require('./queue');

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
  const fn = Queue(async () => {
    count++
    throw new Error()
  }, { failAbort: true, concurrency: 1 })

  await Promise.all([fn(), fn()]).catch(e => e)
  expect(count).toBe(1);
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








