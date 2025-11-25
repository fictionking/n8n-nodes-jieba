const {
  cut,
  cut_all,
  cut_for_search,
  tokenize,
  add_word,
  with_dict,
  tag
} = require("jieba-wasm");
console.log(cut("中华人民共和国武汉市长江大桥", true));
// [ '中华人民共和国', '武汉市', '长江大桥' ]
console.log(cut_all("中华人民共和国武汉市长江大桥", true));
/*
[
  '中',         '中华',
  '中华人民',   '中华人民共和国',
  '华',         '华人',
  '人',         '人民',
  '人民共和国', '民',
  '共',         '共和',
  '共和国',     '和',
  '国',         '武',
  '武汉',       '武汉市',
  '汉',         '市',
  '市长',       '长',
  '长江',       '长江大桥',
  '江',         '大',
  '大桥',       '桥'
]
*/
console.log(cut_for_search("中华人民共和国武汉市长江大桥", true));
/*
[
  '中华',     '华人',
  '人民',     '共和',
  '共和国',   '中华人民共和国',
  '武汉',     '武汉市',
  '长江',     '大桥',
  '长江大桥'
]
*/
console.log(tokenize("中华人民共和国武汉市长江大桥", "default", true));
/*
[
  { word: '中华人民共和国', start: 0, end: 7 },
  { word: '武汉市', start: 7, end: 10 },
  { word: '长江大桥', start: 10, end: 14 }
]
*/
console.log(tokenize("中华人民共和国武汉市长江大桥", "search", true));
/*
[
  { word: '中华', start: 0, end: 2 },
  { word: '华人', start: 1, end: 3 },
  { word: '人民', start: 2, end: 4 },
  { word: '共和', start: 4, end: 6 },
  { word: '共和国', start: 4, end: 7 },
  { word: '中华人民共和国', start: 0, end: 7 },
  { word: '武汉', start: 7, end: 9 },
  { word: '武汉市', start: 7, end: 10 },
  { word: '长江', start: 10, end: 12 },
  { word: '大桥', start: 12, end: 14 },
  { word: '长江大桥', start: 10, end: 14 }
]
*/
console.log(tag("中华人民共和国武汉市长江大桥在哪里啊？"));
/*
[
  [ '中华人民共和国', 'ns' ],
  [ '武汉市', 'ns' ],
  [ '长江大桥', 'ns' ]
]
*/

console.log(cut("桥大江长市汉武的省北湖国和共民人华中"));
/*
[
  '桥', '大江', '长',
  '市', '汉',   '武',
  '的', '省',   '北湖',
  '国', '和',   '共',
  '民', '人',   '华中'
]
*/
["桥大江长", "市汉武", "省北湖", "国和共民人华中"].map((word) => {
  add_word(word);
});
console.log(cut("桥大江长市汉武的省北湖国和共民人华中"));
// ["桥大江长", "市汉武", "的", "省北湖", "国和共民人华中"];

with_dict("自动借书机 1 n\n你好我 100 n"); // 导入自定义字典，词条格式：词语 词频 词性（可选），以换行符分隔
console.log(cut("你好我是一个自动借书机"));
// ["你好", "我", "是", "一个", "自动借书机"];