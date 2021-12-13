const { Retry } = require('./retry');

test('simple retry', async () => {
  let count = 0;
  const fn = Retry((err) => {
    count++;
    if (count <= 1) {
      throw new Error()
    }
    return count;
  })

  expect(await fn()).toBe(count);
  expect(count).toBe(2);
});






