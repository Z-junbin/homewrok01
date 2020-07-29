// 高阶函数

// 1.函数作为参数
function forEach(array, fn) {
  for (let i = 0; i < array.length; i++) {
    fn(array[i]);
  }
}

// 测试

let arr = [2, 9, 0, 7, 9];
forEach(arr, function (item) {
  console.log(item);
});

function filter(array, fn) {
  let res = [];
  for (let i = 0; i < array.length; i++) {
    if (fn(array[i])) {
      res.push(array[i]);
    }
  }
  return res;
}
let r = filter(arr, function (item) {
  return item % 2 === 0;
});
console.log(r);

// 2.函数作为返回值

function once(fn) {
  let done = false;
  return function () {
    if (!done) {
      done = true;
      return fn.apply(this, arguments);
    }
  };
}
let pay = once(function (money) {
  console.log(`支付了${money}`);
});
pay(5);
pay(5);
pay(5);
pay(5);

// map
const map = (array, fn) => {
  let res = [];
  for (let value of array) {
    res.push(fn(value));
  }
  return res;
};
let arrMap = map(arr, (v) => v * v);
console.log(arrMap);

// every
const every = (array, fn) => {
  let res = true;
  for (let value of array) {
    res = fn(value);
    if (!res) {
      break;
    }
  }
  return res;
};
let arrEvery = every(arr, v => v > 1);
console.log(arrEvery);

//some
const some = (array, fn) => {
  let res = true;
  for (let value of array) {
    res = fn(value);
    if (res) {
      break;
    }
  }
  return res;
};
let arrSome = some(arr, v => v > 10);
console.log(arrSome);

// 闭包
function makePower(power) {
  return function(num) {
    return Math.pow(num,power)
  }
}
let power2 = makePower(2)
console.log(power2);
console.log(power2(5));

