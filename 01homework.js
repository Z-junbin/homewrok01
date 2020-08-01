// 简答题
// 一
// 1.js异步编程的理解

/* 异步模式指的是我们的javascript代码不会等待前面的代码执行完毕
才开始执行。我们将执行的代码放入到调用栈中执行，如果是同步的
直接执行，如果是异步的则放入消息队列中等待执行，等到所有的代码
执行完毕，
我们的event loop就上场了，它会监听调用栈和消息队列中的任务
，当调用栈中所有的任务结束以后，它会从消息队列中依次取出回调
函数压入到调用栈，开始执行，直到整个循环结束 */

// 2.eventloop

/* 事件循环的工作就是去查看执行栈是不是空的。如果执行栈是空的，
事件循环就去消息队列里查看是否有等待被执行的回调函数。
在本例里，消息队列包含一个等待被执行的回调函数，执行栈是空的。
事件循环就会把回调函数压到执行栈栈顶去。
在console.log('Async Code')这段代码被压入执行栈栈顶，
执行完毕然后从栈顶弹出之后。之后这个回调函数从栈顶弹出。
到这时，这段程序才算真正地结束了 */

// 3.消息队列都是做什么
/* 消息队列是暂时存放异步任务的地方，我们的异步代码会存放到消息队
列中，等到同步代码执行完毕以后，event loop会从消息队列中依次
取出异步任务放到调用栈中再次执行 */

// 4.什么是宏任务
// 宏任务: 当前调用栈中执行的代码成为宏任务，包括主代码快，定时器
// 5.什么是微任务
// 微任务：宏任务执行完, 在下一个宏任务开始之前需要执行的任务,可以理解为回调函数

// 代码题目

// 一
  function promise(str) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(str)
      }, 10)
    })
  }
  async function PromiseShow() {
    let a = await promise.resolve('hello')
    let b = await promise.resolve('lagou')
    let c = await promise.resolve('I love U')
    console.log(a + b + c)
  }
  PromiseShow()


const fp = require("lodash/fp");
// 二
const cars = [
  { name: "ff", hossepower: 660, dollar_value: 700000, in_stock: true },
  { name: "ss", hossepower: 560, dollar_value: 800000, in_stock: true },
  { name: "cc", hossepower: 460, dollar_value: 900000, in_stock: true },
];
// 练习1.
let isLastInStock = fp.flowRight(fp.prop("in_stock"), fp.last);
console.log(isLastInStock(cars));

// 练习2.
let firstCartsname = fp.flowRight(fp.prop("name"), fp.first);
console.log(firstCartsname(cars));

//练习3.
let _average = function (xs) {
  return fp.reduce(fp.add, 0, xs) / xs.length;
};

let averageDollarValue = fp.flowRight(_average, fp.map('value'))

//练习4.
let sanitizeNames = fp.flowRight(
  fp.split(" "),
  fp.replace(/\s+/g, "_"),
  fp.toLower
);
console.log(sanitizeNames(["Hello World"]));

// 三
// 练习1.
let ex1 = maybe.map(i => fp.map(fp.add(1), i))

//练习2.
let ex2 = () => {
  return fp.first(xs._value);
};

// 练习3.
let ex3 = fp.flowRight(fp.map(i => fp.first(i)), safeProp('name'))

// 练习4.
let ex4 = n => Maybe.of(n).map(parseInt)

//四 手写promise源码

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
class MyPromise {
  constructor(executor) {
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }
  status = PENDING;
  value = undefined;
  reason = undefined;
  successCallback = [];
  failCallback = [];

  resolve = (value) => {
    // 如果状态不是等待 阻止程序向下执行
    if (this.status !== PENDING) return;
    // 将状态更改为成功
    this.status = FULFILLED;
    // 保存成功之后的值
    this.value = value;
    // 判断成功回调是否存在 如果存在 调用
    while (this.successCallback.length) this.successCallback.shift()();
  };
  reject = (reason) => {
    // 如果状态不是等待 阻止程序向下执行
    if (this.status !== PENDING) return;
    // 将状态更改为失败
    this.status = REJECTED;
    // 保存失败后的原因
    this.reason = reason;
    // 判断失败回调是否存在 如果存在 调用
    while (this.failCallback.length) this.failCallback.shift()();
  };
  then(successCallback, failCallback) {
    // 参数可选
    successCallback = successCallback ? successCallback : (value) => value;
    // 参数可选
    failCallback = failCallback
      ? failCallback
      : (reason) => {
          throw reason;
        };
    let promsie2 = new MyPromise((resolve, reject) => {
      // 判断状态
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = successCallback(this.value);
            resolvePromise(promsie2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = failCallback(this.reason);
            resolvePromise(promsie2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        // 等待
        // 将成功回调和失败回调存储起来
        this.successCallback.push(() => {
          setTimeout(() => {
            try {
              let x = successCallback(this.value);
              resolvePromise(promsie2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.failCallback.push(() => {
          setTimeout(() => {
            try {
              let x = failCallback(this.reason);
              resolvePromise(promsie2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promsie2;
  }
  finally(callback) {
    return this.then(
      (value) => {
        return MyPromise.resolve(callback()).then(() => value);
      },
      (reason) => {
        return MyPromise.resolve(callback()).then(() => {
          throw reason;
        });
      }
    );
  }
  catch(failCallback) {
    return this.then(undefined, failCallback);
  }
  static all(array) {
    let result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      function addData(key, value) {
        result[key] = value;
        index++;
        if (index === array.length) {
          resolve(result);
        }
      }
      for (let i = 0; i < array.length; i++) {
        let current = array[i];
        if (current instanceof MyPromise) {
          // promise 对象
          current.then(
            (value) => addData(i, value),
            (reason) => reject(reason)
          );
        } else {
          // 普通值
          addData(i, array[i]);
        }
      }
    });
  }
  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }
}

function resolvePromise(promsie2, x, resolve, reject) {
  if (promsie2 === x) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }
  if (x instanceof MyPromise) {
    // promise 对象
    x.then(resolve, reject);
  } else {
    // 普通值
    resolve(x);
  }
}
