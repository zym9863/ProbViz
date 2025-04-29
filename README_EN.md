# ProbViz - Probability Visualization Tool

English | [简体中文](./README.md)

ProbViz is a probability model visualization tool developed with Vue 3 and TypeScript, designed to help users intuitively understand important concepts in probability theory, such as the Law of Large Numbers and the Central Limit Theorem.

## Features

- **Law of Large Numbers Visualization**: Demonstrates how sample averages gradually approach the theoretical probability as the number of trials increases through coin toss simulations.
- **Central Limit Theorem Visualization**: Shows the distribution of sample means from different distributions, verifying the universality of the Central Limit Theorem.
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

## Contribution Guidelines

Suggestions for improvement or code contributions to this project are welcome. Please follow these steps:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
