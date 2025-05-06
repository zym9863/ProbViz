# ProbViz - Probability Visualization Tool

English | [简体中文](./README.md)

ProbViz is a probability model visualization tool developed with Vue 3 and TypeScript, designed to help users intuitively understand important concepts in probability theory, such as the Law of Large Numbers and the Central Limit Theorem.

## Features

- **Law of Large Numbers Visualization**: Demonstrates how sample averages gradually approach the theoretical probability as the number of trials increases through coin toss simulations.
- **Central Limit Theorem Visualization**: Shows the distribution of sample means from different distributions, verifying the universality of the Central Limit Theorem.
- **Common Probability Distributions Exploration**: Visualizes probability density functions and cumulative distribution functions of common distributions (such as normal, binomial, and Poisson), allowing users to adjust parameters (like mean, variance, λ, n, p) using sliders and observe changes in the graphs.
- **Interactive Parameter Adjustment**: Users can adjust parameters such as sample size, number of trials, and probability values to observe results in real-time.
- **Multilingual Support**: Supports both English and Chinese interfaces to meet the needs of different users.
- **Modern UI Design**: Employs responsive design for an excellent user experience.

## Technology Stack

- **Frontend Framework**: Vue 3
- **Development Language**: TypeScript
- **Build Tool**: Vite
- **Chart Library**: Chart.js + Vue-ChartJS
- **Internationalization**: Custom i18n implementation

## Project Setup

### Install Dependencies

```sh
npm install
```

### Run in Development Environment

```sh
npm run dev
```

### Build for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Project Structure

```
src/
├── assets/         # Static resources
├── components/     # Vue components
│   ├── CentralLimitTheorem.vue  # Central Limit Theorem visualization component
│   ├── ControlPanel.vue         # Control panel component
│   ├── LawOfLargeNumbers.vue    # Law of Large Numbers visualization component
│   ├── LanguageSwitcher.vue     # Language switcher component
│   ├── ProbabilityDistributions.vue # Probability distributions exploration component
│   └── ProbabilitySimulator.vue # Main simulator component
├── i18n/           # Internationalization
│   ├── index.ts    # Language configuration
│   └── utils.ts    # Translation utility functions
└── App.vue         # Application entry component
```

## Probability Models Explanation

### Law of Large Numbers

The Law of Large Numbers states that as the number of trials increases, the average of the results will get closer to the expected value. In this application, we demonstrate how the sample average approaches the true probability as the number of trials increases through coin toss simulations.

### Central Limit Theorem

The Central Limit Theorem states that as the sample size increases, the distribution of sample means approaches a normal distribution, regardless of the population's distribution. This application supports sampling from uniform, normal, exponential, and binomial distributions to show the distribution of their sample means.

### Probability Distributions Exploration

This feature allows users to interactively explore the characteristics of common probability distributions. Users can select different distributions (normal, uniform, exponential, binomial, and Poisson) and adjust distribution parameters using sliders to observe real-time changes in probability density functions (PDF) and cumulative distribution functions (CDF). This helps to visually understand how different parameters affect the shape of distributions.

## Contribution Guidelines

Suggestions for improvement or code contributions to this project are welcome. Please follow these steps:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
