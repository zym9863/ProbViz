import { messages } from './index';

// 简单的翻译函数，支持参数替换
export function t(locale: string, key: string, params: Record<string, any> = {}): string {
  const message = messages[locale]?.[key] || key;
  
  // 替换参数 {paramName} 为实际值
  return message.replace(/{(\w+)}/g, (_, paramName) => {
    return params[paramName] !== undefined ? String(params[paramName]) : `{${paramName}}`;
  });
}

// 获取分布名称的本地化版本
export function getLocalizedDistribution(locale: string, distribution: string): string {
  const distributionKey = distribution.toLowerCase();
  return messages[locale]?.[distributionKey] || distribution;
}
