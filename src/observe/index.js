import { newArrayProto } from './array'
import Dep from './dep'
class Observer {
  constructor(data) {
    // Object.defineProperty 只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false // 将__ob__变成了不可枚举（循环的时候无法获取到）
    })

    if (Array.isArray(data)) {
      // 这里我么可以重写数组中的方法， 7个变异方法 是可以修改数组本身的
      data.__proto__ = newArrayProto
      this.ovserverArray(data); // 如果数组中放的是对象 可以监控到对象的变化
    } else {
      this.walk(data)
    }

  }
  walk(data) { // 循环对象对属性依次劫持
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))

  }
  ovserverArray(data) { // 观测数组
    data.forEach(item => observe(item))
  }

}

export function defineReactive(target, key, value) {
  observe(value); // 对所有的对象都进行属性劫持
  let dep = new Dep(); // 每个属性都有一个dep
  Object.defineProperty(target, key, {
    get() {
      console.log('用户取值了', key)
      if (Dep.target) {
        dep.depend(); // 让这个属性的收集器记住当前的watcher
      }
      return value
    },
    set(newValue) { // 修改的时候 会执行set
      if (value === newValue) return;
      observe(newValue) // 如果设置的值也是一个对象 也需要观测
      console.log('用户设置值了')
      value = newValue;
      dep.notify()
    }
  })
}

export function observe(data) {
  // 对这个对象进行劫持
  if (typeof data !== 'object' || data == null) {
    return;
  }
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  // 如果一个对象被劫持过了，那就不需要在被劫持了（要判断一个对象是否被劫持过，可以增添一个实例用实例来判断是否被劫持过）

  return new Observer(data)

}
