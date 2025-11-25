import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import * as fs from 'fs';

// 导入jieba-wasm库
import { cut, cut_all, cut_for_search, with_dict, add_word, tag } from 'jieba-wasm';

// 全局变量存储词典加载状态
// 在n8n中，节点实例是单例的，但execute方法中的this是IExecuteFunctions类型
let dictionaryConfig: {
  customDictionary: string;
  dictionaryText: string;
  dictionaryPath: string;
} | null = null;
let dictionaryLoaded = false;

/**
 * 处理自定义词典（文本输入）
 * @param dictionaryContent - 词典内容字符串，格式支持：词 词频 词性（可选）
 */
function processTextDictionary(dictionaryContent: string): void {
  if (!dictionaryContent) return;

  // 按行分割
  const lines = dictionaryContent.split('\n');

  // 处理每一行
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // 使用空格分割，支持：词 词频 词性（可选）
    const parts = trimmedLine.split(/\s+/);
    const word = parts[0];
    let freq: number | null = null;
    let tag: string | null = null;

    // 如果有第二个参数，解析为词频
    if (parts.length >= 2) {
      const freqStr = parts[1];
      const parsedFreq = parseInt(freqStr, 10);
      if (!isNaN(parsedFreq)) {
        freq = parsedFreq;
      }

      // 如果有第三个参数，解析为词性（只有在提供了词频的情况下）
      if (parts.length >= 3 && freq !== null) {
        tag = parts[2];
      }
    }

    // 添加单词到词典
    add_word(word, freq, tag);
  });
}

/**
 * 处理自定义词典（文件输入）
 * @param dictionaryContent - 词典内容字符串，格式为：词语 词频 词性（可选），以换行符分隔
 */
function processFileDictionary(dictionaryContent: string): void {
  if (!dictionaryContent) return;

  // 使用with_dict直接传入整个词典内容（包括换行符）
  with_dict(dictionaryContent);
}

/**
 * 检查词典配置是否变更
 * @param newConfig - 新的词典配置
 * @returns 是否需要重新加载词典
 */
function hasDictionaryChanged(newConfig: {
  customDictionary: string;
  dictionaryText?: string;
  dictionaryPath?: string;
}): boolean {
  // 如果之前没有配置或自定义词典模式改变，需要重新加载
  if (!dictionaryConfig || dictionaryConfig.customDictionary !== newConfig.customDictionary) {
    return true;
  }

  // 根据不同的输入方式检查配置是否变更
  if (newConfig.customDictionary === 'text' &&
    dictionaryConfig.dictionaryText !== newConfig.dictionaryText) {
    return true;
  }

  if (newConfig.customDictionary === 'file' &&
    dictionaryConfig.dictionaryPath !== newConfig.dictionaryPath) {
    return true;
  }

  return false;
}

/**
 * 加载自定义词典
 * @param config - 词典配置
 */
function loadCustomDictionary(config: {
  customDictionary: string;
  dictionaryText?: string;
  dictionaryPath?: string;
}): void {
  // 暂存新配置，先不更新全局配置，因为需要先检查是否有变化
  const newConfig = {
    customDictionary: config.customDictionary,
    dictionaryText: config.dictionaryText || '',
    dictionaryPath: config.dictionaryPath || '',
  };

  // 如果不使用自定义词典，重置加载状态并更新配置
  if (config.customDictionary === 'none') {
    dictionaryConfig = newConfig;
    dictionaryLoaded = false;
    return;
  }

  // 如果配置没变且已经加载过，不需要重新加载
  // 这里依赖hasDictionaryChanged函数严格比较参数值与上次的是否相同
  if (dictionaryLoaded && !hasDictionaryChanged(config)) {
    // 更新配置为最新值（即使没有变更也更新，确保与当前参数一致）
    dictionaryConfig = newConfig;
    return;
  }

  // 配置有变更，更新全局配置并重新加载词典
  dictionaryConfig = newConfig;
  
  try {
    if (config.customDictionary === 'text' && config.dictionaryText) {
      // 从文本输入获取词典内容并处理
      processTextDictionary(config.dictionaryText);
      dictionaryLoaded = true;
    } else if (config.customDictionary === 'file' && config.dictionaryPath) {
      // 从文件获取词典内容并处理
      if (!fs.existsSync(config.dictionaryPath)) {
        throw new Error(`词典文件不存在: ${config.dictionaryPath}`);
      }
      const dictionaryContent = fs.readFileSync(config.dictionaryPath, 'utf-8');
      processFileDictionary(dictionaryContent);
      dictionaryLoaded = true;
    }
  } catch (error) {
    // 加载失败时不设置标志，允许下次尝试重新加载
    dictionaryLoaded = false;
  }
}

/**
 * JiebaTokenizer节点
 * 基于jieba-wasm的中文分词功能
 */
export class JiebaTokenizer implements INodeType {

  /**
   * 节点描述信息
   */
  description: INodeTypeDescription = {
    displayName: 'Jieba 分词器',
    name: 'jiebaTokenizer',
    icon: 'file:jieba.svg',
    group: ['transform'],
    version: 1,
    description: '使用jieba-wasm进行中文分词',
    defaults: {
      name: 'Jieba 分词器',
      color: '#772244',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: '文本',
        name: 'text',
        type: 'string',
        default: '',
        required: true,
        description: '要进行分词的中文文本',
        placeholder: '输入要分词的中文文本',
      },
      { displayName: '分词模式', name: 'mode', type: 'options', options: [{ name: '精确模式', value: 'default' }, { name: '全模式', value: 'full' }, { name: '搜索引擎模式', value: 'search' }, { name: '词性标注模式', value: 'tag' },], default: 'default', description: '选择分词模式', },
      {
        displayName: '自定义词典',
        name: 'customDictionary',
        type: 'options',
        options: [
          { name: '文本输入', value: 'text' },
          { name: '文件路径', value: 'file' },
          { name: '不使用', value: 'none' },
        ],
        default: 'none',
        description: '选择自定义词典的输入方式',
      },
      {
        displayName: '词典文本',
        name: 'dictionaryText',
        type: 'string',
        typeOptions: {
          rows: 6,
        },
        default: '',
        placeholder: '词语\n词语 词频\n词语 词频 词性',
        description: '自定义词典内容，每个词单独占一行，支持三种格式：1.单独词语 2.词语 词频 3.词语 词频 词性（当使用词性时必须提供词频）',
        displayOptions: {
          show: {
            customDictionary: ['text'],
          },
        },
      },
      {
        displayName: '词典文件路径',
        name: 'dictionaryPath',
        type: 'string',
        default: '',
        placeholder: 'C:\\path\\to\\dictionary.txt',
        description: '自定义词典文件的绝对路径，文件格式为每行一个词条，格式为：词语 词频 词性（可选），以换行符分隔。例如：张三 10 nr',
        displayOptions: {
          show: {
            customDictionary: ['file'],
          },
        },
      },

    ],
  };



  /**
   * 执行节点功能
   * @param this - 当前执行上下文
   */
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // 获取输入数据
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    let item: INodeExecutionData;

    try {
      // 处理每个输入项
      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        try {
          // 获取词典配置（每个输入项单独获取，确保能检测配置变更）
          const customDictionary = this.getNodeParameter('customDictionary', itemIndex) as string;
          const config: { customDictionary: string; dictionaryText?: string; dictionaryPath?: string } = {
            customDictionary
          };

          if (customDictionary === 'text') {
            config.dictionaryText = this.getNodeParameter('dictionaryText', itemIndex) as string;
          } else if (customDictionary === 'file') {
            config.dictionaryPath = this.getNodeParameter('dictionaryPath', itemIndex) as string;
          }
          
          // 加载或更新自定义词典
          loadCustomDictionary(config);
          
          // 获取文本和模式参数
          const text = this.getNodeParameter('text', itemIndex) as string;
          const mode = this.getNodeParameter('mode', itemIndex) as string;

          let tokens: string[] = [];

          // 根据模式执行分词
          // 定义词性标注结果的类型，匹配jieba-wasm的tag函数返回类型
          interface TaggedToken {
            word: string;
            tag: string;
          }
          let taggedTokens: TaggedToken[] = [];

          switch (mode) {
            case 'full':
              // 全模式 - 扫描出所有可能的词语
              tokens = cut_all(text);
              break;
            case 'search':
              // 搜索引擎模式 - 对长词再次切分
              tokens = cut_for_search(text);
              break;
            case 'tag':
              // 词性标注模式 - 分词并返回词性
              taggedTokens = tag(text);
              break;
            case 'default':
            default:
              // 精确模式 - 最适合文本分析
              tokens = cut(text);
              break;
          }

          // 创建输出数据
          item = {
            json: {
              ...items[itemIndex].json,
              originalText: text,
              tokens: mode === 'tag' ? taggedTokens.map(token => token.word) : tokens,
              tokenCount: mode === 'tag' ? taggedTokens.length : tokens.length,
              mode,
              ...(mode === 'tag' && {
                taggedTokens,
                tokensWithTags: taggedTokens,
              }),
            },
          };

          // 添加元数据
          if (items[itemIndex].pairedItem) {
            item.pairedItem = items[itemIndex].pairedItem as any;
          }

          returnData.push(item);
        } catch (itemError) {
          // 处理单个项目的错误
          if (this.continueOnFail()) {
            returnData.push({
              json: {
                error: String(itemError),
              },
            });
            continue;
          }
          throw itemError;
        }
      }

      return [returnData];
    } catch (error) {
      throw new Error(`Jieba分词执行失败: ${String(error)}`);
    }
  }
}