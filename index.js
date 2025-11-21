/**
 * n8n-nodes-jieba
 * 基于jieba-wasm的中文分词n8n节点插件
 */

module.exports = {
  // 导出节点
  nodes: [
    require('./dist/nodes/JiebaTokenizer/JiebaTokenizer.node.js'),
  ],
  // 节点版本
  version: require('./package.json').version,
};