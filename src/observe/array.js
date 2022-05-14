
let oldArrayProto = Array.prototype; //获取数组的原型


export let newArrayProto = Object.create(oldArrayProto);

let methods = [ // 找到所有的变异方法
  "push",
  "pop",
  "shift",
  "unshift",
  "sort",
  "splice"
]

methods.forEach(method => {
  // arr.push(1,2,3)
  newArrayProto[method] = function (...args) { //这里重写了数组的方法
    // todo...
    const result = oldArrayProto[method].call(this, ...args) // 内部调用原来的方法

    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2)
        break;
      default:
        break;
    }
    if (inserted) { // 对新增的内容再次观测
      ob.ovserverArray(inserted)
    }
    return result;
  }
})
