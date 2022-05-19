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
    this.get();
  }
}


// 需要给每个属性增加一个dep 目的就是收集watcher
// 一个视图中 有多少个属性 （n个属性会对应一个视图） n个dep对应一个watcher
// 一个属性对应多个视图
export default Watcher
