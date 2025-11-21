import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

// 导入jieba-wasm库
import { cut, cut_all, cut_for_search } from 'jieba-wasm';

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
      {
        displayName: '分词模式',
        name: 'mode',
        type: 'options',
        options: [
          { name: '精确模式', value: 'default' },
          { name: '全模式', value: 'full' },
          { name: '搜索引擎模式', value: 'search' },
        ],
        default: 'default',
        description: '选择分词模式',
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
        // jieba-wasm 不需要额外初始化
        // 处理每个输入项
      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        try {
          // 获取文本和模式参数
          const text = this.getNodeParameter('text', itemIndex) as string;
          const mode = this.getNodeParameter('mode', itemIndex) as string;

          let tokens: string[] = [];

          // 根据模式执行分词
          switch (mode) {
            case 'full':
              // 全模式 - 扫描出所有可能的词语
              tokens = cut_all(text);
              break;
            case 'search':
              // 搜索引擎模式 - 对长词再次切分
              tokens = cut_for_search(text);
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
              tokens,
              tokenCount: tokens.length,
              mode,
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