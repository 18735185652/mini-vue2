import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { nextTick } from './observe/watcher'
// 将所有的方法都耦合在一起

function Vue(options) { // options 就是用户的选项
  this._init(options)
}

Vue.prototype.$nextTick = nextTick;

initMixin(Vue) // 扩展了init方法
initLifeCycle(Vue) //
export default Vue
