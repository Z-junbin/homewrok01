const { compose, curry } = require("folktale/core/lambda");
const { toUpper, first, split, find } = require("lodash/fp");
const { task } = require("folktale/concurrency/task");
const fs = require("fs");

let f = curry(2, (x, y) => {
  return x + y;
});
console.log(f(1, 2), f(1, 2));

let f1 = compose(toUpper, first);
console.log(f1(["one", "two"]));

// Task函子  解决异步任务
function readFile(filename) {
  return task((resolver) => {
    fs.readFile(filename, "utf-8", (err, data) => {
      if (err) resolver.reject(err);
      resolver.resolve(data);
    });
  });
}
readFile("package.json")
  .map(split('\n'))
  .map(find(x => x.includes('version')))
  .run()
  .listen({
    onRejected: (err) => {
      console.log(err);
    },
    onResolved: (value) => {
      console.log(value);
    },
  });

