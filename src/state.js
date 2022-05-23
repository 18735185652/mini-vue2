import Dep from './observe/dep'
import { observe } from './observe/index'
import Watcher from './observe/watcher'
export function initState(vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
}
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]
    },
    set(newValue) {
      vm[target][key] = newValue
    }
  })
}

function initData(vm) {
  let data = vm.$options.data
  data = typeof data === 'function' ? data.call(vm) : data
  vm._data = data
  // 对数据进行劫持 vue2里采用了一个api defineProperty
  observe(data)

  // 将vm._data 用vm来代理就可以了
  for (let key in data) {
    proxy(vm, '_data', key)
  }
}

function initComputed(vm) {
  const cpmputed = vm.$options.computed
  const watchers = (vm._computedWatchers = {}) // 将计算属性watchers保存到vm上
  for (let key in cpmputed) {
    let userDef = cpmputed[key]
    //我们需要计算监控 计算属性中get的变化
    const fn = typeof userDef === 'function' ? userDef : userDef.get
    // 如果直接new Watcher 默认会走fn,将属性和watcher对应起来
    watchers[key] = new Watcher(vm, fn, { lazy: true })
    defineComputed(vm, key, userDef)
  }

  function defineComputed(target, key, userDef) {
    const setter = userDef.set || (() => {})
    // 可以通过实例拿到对应的属性
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    })
  }
  console.log('cpmputed: ', cpmputed)
}

function createComputedGetter(key) {
  //检测是否执行getter
  return function () {
    const watcher = this._computedWatchers[key]
    if (watcher.dirty) {
      watcher.evaluate()
    }
    if(Dep.target){ // 计算属性出栈后还有渲染watcher 让计算属性watcher里的属性也去收集上层watcher
      watcher.depend()
    }
    return watcher.value
  }
}
