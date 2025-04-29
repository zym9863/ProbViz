# ProbViz - 概率可视化工具

[English](./README_EN.md) | 简体中文

ProbViz是一个基于Vue 3和TypeScript开发的概率模型可视化工具，旨在帮助用户直观理解概率论中的重要概念，如大数定律和中心极限定理。

## 功能特点

- **大数定律可视化**：通过模拟硬币投掷实验，展示随着试验次数增加，样本平均值逐渐接近理论概率的过程。
- **中心极限定理可视化**：展示不同分布的样本均值分布，验证中心极限定理的普适性。
- **交互式参数调整**：用户可以调整样本大小、试验次数、概率值等参数，实时观察结果变化。
- **多语言支持**：支持中文和英文界面，满足不同用户的需求。
- **现代化UI设计**：采用响应式设计，提供良好的用户体验。

## 技术栈

- **前端框架**：Vue 3
- **开发语言**：TypeScript
- **构建工具**：Vite
- **图表库**：Chart.js + Vue-ChartJS
- **国际化**：自定义i18n实现

## 项目设置

### 安装依赖

```sh
npm install
```

### 开发环境运行

```sh
npm run dev
```

### 生产环境构建

```sh
npm run build
```

### 预览生产构建

```sh
npm run preview
```

## 项目结构

```
src/
├── assets/         # 静态资源
├── components/     # Vue组件
│   ├── CentralLimitTheorem.vue  # 中心极限定理可视化组件
│   ├── ControlPanel.vue         # 控制面板组件
│   ├── LawOfLargeNumbers.vue    # 大数定律可视化组件
│   ├── LanguageSwitcher.vue     # 语言切换组件
│   └── ProbabilitySimulator.vue # 主模拟器组件
├── i18n/           # 国际化相关
│   ├── index.ts    # 语言配置
│   └── utils.ts    # 翻译工具函数
└── App.vue         # 应用入口组件
```

## 概率模型说明

### 大数定律

大数定律表明，随着试验次数的增加，结果的平均值将越来越接近预期值。在本应用中，我们通过模拟硬币投掷实验，展示样本平均值如何随着试验次数的增加而趋近于真实概率。

### 中心极限定理

中心极限定理表明，随着样本量的增加，样本均值的分布趋近于正态分布，无论总体分布如何。本应用支持从均匀分布、正态分布、指数分布和二项分布中抽取样本，展示其样本均值的分布情况。

## 贡献指南

欢迎对本项目提出改进建议或贡献代码。请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证

本项目采用MIT许可证 - 详情请参见LICENSE文件
