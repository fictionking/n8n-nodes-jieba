/**
 * 简单测试脚本，验证jieba-wasm库的基本功能
 */

const { cut, cut_all, cut_for_search } = require('jieba-wasm');

async function testJieba() {
  try {
    console.log('开始测试jieba-wasm...');
    
    const testText = '我爱北京天安门';
    
    console.log('\n测试文本:', testText);
    console.log('========================================');
    
    // 测试精确模式
    const defaultTokens = cut(testText);
    console.log('精确模式分词结果:', defaultTokens);
    
    // 测试全模式
    const fullTokens = cut_all(testText);
    console.log('全模式分词结果:', fullTokens);
    
    // 测试搜索引擎模式
    const searchTokens = cut_for_search(testText);
    console.log('搜索引擎模式分词结果:', searchTokens);
    
    console.log('\n测试完成！所有分词模式都正常工作。');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 执行测试
testJieba().catch(console.error);