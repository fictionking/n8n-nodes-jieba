![Jieba Tokenizer](jieba.svg)
# @fictionking/n8n-nodes-jieba

一个基于jieba-wasm的中文分词n8n节点插件，用于在n8n自动化工作流中进行中文文本分词处理。

## 功能特点

- 支持多种分词模式：
  - 精确模式：最适合文本分析
  - 全模式：扫描出文本中所有可能的词语
  - 搜索引擎模式：在精确模式基础上，对长词再次切分
- 简单易用的界面配置
- 完整的错误处理
- 详细的输出结果

## 安装方法

### 方法一：通过n8n社区节点管理

在n8n的Web界面中，通过"设置" > "社区节点" > "安装"，搜索并安装`@fictionking/n8n-nodes-jieba`。

### 方法二：手动安装

```bash
# 在n8n安装目录下执行
npm install @fictionking/n8n-nodes-jieba

# 或者全局安装
npm install -g @fictionking/n8n-nodes-jieba
```

安装后，重启n8n服务，节点将会出现在节点面板的"转换"类别中。

## 使用示例

1. 在n8n工作流中添加"Jieba 分词器"节点
2. 配置输入文本（可以是静态文本或动态字段）
3. 选择分词模式
4. 连接其他节点处理分词结果

## 输出结果

节点执行后，输出数据将包含以下字段：

- `originalText`: 原始输入文本
- `tokens`: 分词结果数组
- `tokenCount`: 分词数量
- `mode`: 使用的分词模式

## 开发说明

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 运行测试

```bash
npm run test
```

## 许可证

MIT License