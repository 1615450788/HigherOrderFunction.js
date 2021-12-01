const { retryWarpper } = require('./retry');

test('simple retry', async () => {
  let count = 0;
  const fn = retryWarpper((err) => {
    count++;
    if (count <= 1) {
      throw new Error()
    }
    return count;
  }, { debug: true })

  expect(await fn()).toBe(count);
  expect(count).toBe(2);
});






