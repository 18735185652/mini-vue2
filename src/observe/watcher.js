import Dep from "./dep";

let id = 0;

// 1. 当我们创建渲染watcher的时候 会把当前渲染watcher放到dep.target中
// 2. 调用_render() 会取值 会走到get上

class Watcher { // 不同的组件有不同的watcher 目前只有一个 渲染根实例的
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options; // 是一个渲染watcher
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作
    this.deps = []; // 实现计算属性和一些清理工作需要用到
    this.depsId = new Set();
    this.get();
  }
  addDep(dep) { // 一个组件对应多个属性 重复的属性也不用记录
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id);
      dep.addSub(this); // watcher已经记住dep 而且已经去重 让dep也记住watcher
    }
  }
  get() {
    Dep.target = this; // 静态属性
    this.getter(); // 会去vm上取值
    Dep.target = null; // 渲染完毕后清空
  }
  update() {
    queueWatcher(this)

  }
  run() {
    this.get();
  }
}


let queue = [];
let has = [];
let pedding = false;
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  pedding = false;
  flushQueue.forEach(q => q.run())
}
function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    if (!pedding) {
      // setTimeout(flushSchedulerQueue, 0)
      nextTick(flushSchedulerQueue, 0)

    }
  }
}

let callbacks = [];
let wating = false;

function flushCallbacks() {
  const cbs = callbacks.slice(0);
  wating = false;
  callbacks = []
  cbs.forEach(cb => cb());
}




// nextTick没有直接使用某个api 而是采用优雅降级的方式
// 内部先采用的是promise（ie不兼容）=> MutationObserver(H5 API) =》 ie专用  setImmediate =》 setTimeout

let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else if (MutationObserver) {
  let observer = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    textNode.textContent = 2;
  }

} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks)
  }
}



export function nextTick(cb) {
  callbacks.push(cb)
  if (!wating) {
    // setTimeout(() => {
    //   flushCallbacks() // 最后一起刷新
    // }, 0)
    timerFunc()
    wating = true;

  }
}


// 需要给每个属性增加一个dep 目的就是收集watcher
// 一个视图中 有多少个属性 （n个属性会对应一个视图） n个dep对应一个watcher
// 一个属性对应多个视图
export default Watcher
