const fp = require("lodash/fp");
const fs = require("fs");

// Functor 函子
// 基本函子
/* class container{
  constructor(value) {
    this._value = value
  }
  map(fn) {
    return new container(fn(this._value))
  }
}

let r = new container(5)
      .map(x => x + 1)
      .map(x => x * x)
console.log(r); */

// 函数式编程的思想
class container {
  static of(value) {
    return new container(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return container.of(fn(this._value));
  }
}

// 传入 null、undefined
let r = container
  .of(5)
  .map((x) => x + 1)
  .map((x) => x * x);
console.log(r);

// maybe函子（对外面传入空值做处理）控制副作用
class MayBe {
  static of(value) {
    return new MayBe(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return this.isNothing() ? MayBe.of(null) : MayBe.of(fn(this._value));
  }
  isNothing() {
    return this._value === null || this._value === undefined;
  }
}
let m = MayBe.of("hello world").map((x) => x.toUpperCase());
console.log(m);

let n = MayBe.of(null).map((x) => x.toUpperCase());

// 问题：不知道null出现在哪里
let o = MayBe.of("hello world")
  .map((x) => x.toUpperCase())
  .map((x) => null)
  .map((x) => x.split(" "));
console.log(o);

// Either 解决上面的问题

class left {
  static of(value) {
    return new left(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return this;
  }
}

class right {
  static of(value) {
    return new right(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return right.of(fn(this._value));
  }
}

let f1 = right.of(12).map((x) => x + 2);
let f2 = left.of(12).map((x) => x + 2);
console.log(f1, f2);

function parseJSON(str) {
  try {
    return right.of(JSON.parse(str));
  } catch (error) {
    return left.of({ error: error.message });
  }
}
let f3 = parseJSON("{name: is}");
console.log(f3);
let f4 = parseJSON('{"name": "is"}').map((x) => x.name.toUpperCase());
console.log(f4);

// IO函子 内部的值始终是一个函数
class IO {
  static of(value) {
    return new IO(function () {
      return value;
    });
  }
  constructor(fn) {
    this._value = fn;
  }
  map(fn) {
    return new IO(fp.flowRight(fn, this._value));
  }
}
let f5 = IO.of(process).map(p => p.execPath)

console.log("555", f5._value());

let readFile = function (filename) {
  return new IO(function () {
    return fs.readFileSync(filename,'utf-8')
  })
}
let print = function (x) {
  return new IO(function () {
    console.log(x);
    return x
  })
}
let cat = fp.flowRight(print,readFile)
let cat1 = cat('package.json')._value()._value()
console.log(cat1);