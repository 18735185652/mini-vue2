

class Observer {
  constructor(data) {
    // Object.defineProperty 只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
    this.walk(data)
  }
  walk(data) { // 循环对象对属性依次劫持
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))

  }
}

export function defineReactive(target, key, value) {
  observe(value); // 对所有的对象都进行属性劫持
  Object.defineProperty(target, key, {
    get() {
      console.log('用户取值了')
      return value
    },
    set(newValue) { // 修改的时候 会执行set
      if (value === newValue) return;
      console.log('用户设置值了')
      value = newValue
    }
  })
}

export function observe(data) {
  // 对这个对象进行劫持
  if (typeof data !== 'object' || data == null) {
    return;
  }
  console.log('data111: ', data);
  // 如果一个对象被劫持过了，那就不需要在被劫持了（要判断一个对象是否被劫持过，可以增添一个实例用实例来判断是否被劫持过）

  return new Observer(data)

}
