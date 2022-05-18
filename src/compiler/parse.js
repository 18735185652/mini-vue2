
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的 属性的第一个分组就是key value
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  <div> <br/>
// const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{ asdsadsa }} 匹配到的内容是我们表达式的变量


export function parseHTML(html) {
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = [];
  let currentParent; // 指向的是栈中的最后一个
  let root;
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs); // 创造一个ast节点
    if (!root) {   // 看一下是否为空树
      root = node; // 如果为空则当前是树的根节点
    }
    if (currentParent) {
      node.parent = currentParent; // 只赋予了parent属性
      currentParent.children.push(node); // 还需要让父亲记住自己
    }
    stack.push(node)
    currentParent = node;

    // console.log('root', root)
  }
  function chars(text) {
    text = text.replace(/\s/g, '');
    if (text) {
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent
      })
    }
  }
  function end(tag) {
    console.log('end: ', tag);
    let node = stack.pop();
    currentParent = stack[stack.length - 1];
  }

  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: []
      }
      advance(start[0].length)

      // 如果不是开始标签的结束 就一直匹配下去
      let attr, end;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        })
      }
      if (end) {
        advance(end[0].length)
        // console.log('attr[0].length: ', attr[0].length);
      }
      return match;
    }

    // console.log(html)
    return false;
  }

  while (html) { // html最开始肯定是一个 <   <div>hello</div>
    // 如果textEnd 为0 说明是一个开始标签或者结束标签
    // 如果textEnd >0 说明就是文本的结束位置
    let textEnd = html.indexOf('<'); // 如果indexOf中的索引是0 则说明是个标签
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue;
      }
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1])
        continue;
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd); // 文本内容
      if (text) {
        chars(text)
        advance(text.length)
      }
    }

  }
  // console.log('cc', html)
  return root;
}
