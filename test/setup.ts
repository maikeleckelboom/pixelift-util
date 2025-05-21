expect.extend({
  toStrictlyIncrease(received: number[]) {
    const pass = received.every((v, i, arr) => i === 0 || v > arr[i - 1]!);
    return {
      pass,
      message: () =>
        `Expected array to strictly increase, but got: ${JSON.stringify(received)}`,
    };
  },
});
