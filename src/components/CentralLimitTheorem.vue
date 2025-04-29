<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'vue-chartjs';
import { getLocalizedDistribution } from '../i18n/utils';

Chart.register(...registerables);

// 注入翻译函数和当前语言
const t = inject('t') as (key: string, params?: Record<string, any>) => string;
const locale = inject('locale') as { value: string };

const props = defineProps({
  params: {
    type: Object,
    required: true
  }
});

const sampleMeans = ref<number[]>([]);
const histogramData = ref({
  labels: [],
  datasets: [
    {
      label: t('frequency'),
      backgroundColor: 'rgba(66, 185, 131, 0.6)',
      data: []
    }
  ]
});

const histogramOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        lineWidth: 1
      },
      ticks: {
        color: 'rgba(44, 62, 80, 0.7)',
        font: {
          size: 11
        }
      },
      title: {
        display: true,
        text: 'Frequency',
        color: 'rgba(44, 62, 80, 0.9)',
        font: {
          size: 13,
          weight: 'bold'
        },
        padding: {top: 10, bottom: 10}
      }
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        lineWidth: 1
      },
      ticks: {
        color: 'rgba(44, 62, 80, 0.7)',
        font: {
          size: 11
        },
        maxRotation: 0
      },
      title: {
        display: true,
        text: 'Sample Mean',
        color: 'rgba(44, 62, 80, 0.9)',
        font: {
          size: 13,
          weight: 'bold'
        },
        padding: {top: 10, bottom: 0}
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#2c3e50',
      bodyColor: '#2c3e50',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      cornerRadius: 6,
      padding: 10,
      boxPadding: 6,
      callbacks: {
        label: function(context: any) {
          return `Frequency: ${context.parsed.y}`;
        },
        title: function(tooltipItems: any) {
          return `Mean: ${tooltipItems[0].label}`;
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart'
  },
  barPercentage: 0.9,
  categoryPercentage: 0.9,
  borderRadius: 3
});

// Generate random samples based on the selected distribution
const generateSample = (distribution: string): number => {
  switch (distribution) {
    case 'uniform':
      return Math.random(); // Uniform distribution between 0 and 1

    case 'normal':
      // Box-Muller transform to generate normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return z * props.params.stdDev + props.params.mean;

    case 'exponential':
      // Exponential distribution with rate parameter 1
      return -Math.log(Math.random());

    case 'binomial':
      // Binomial distribution with p=0.5, n=1 (Bernoulli)
      return Math.random() < 0.5 ? 1 : 0;

    default:
      return Math.random();
  }
};

const runSimulation = () => {
  sampleMeans.value = [];

  // Run the simulation for the specified number of trials
  for (let i = 0; i < props.params.numTrials; i++) {
    let sum = 0;

    // Generate a sample of the specified size
    for (let j = 0; j < props.params.sampleSize; j++) {
      sum += generateSample(props.params.distribution);
    }

    // Calculate the sample mean
    const mean = sum / props.params.sampleSize;
    sampleMeans.value.push(mean);
  }

  updateHistogram();
};

const updateHistogram = () => {
  // Calculate min and max values for the histogram
  const min = Math.min(...sampleMeans.value);
  const max = Math.max(...sampleMeans.value);

  // Calculate the number of bins (using Sturges' formula)
  const numBins = Math.ceil(Math.log2(sampleMeans.value.length) + 1);
  const binWidth = (max - min) / numBins;

  // Create bins
  const bins = Array(numBins).fill(0);
  const binLabels = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    binLabels.push(binStart.toFixed(2));
  }

  // Count frequencies
  sampleMeans.value.forEach(mean => {
    const binIndex = Math.min(
      Math.floor((mean - min) / binWidth),
      numBins - 1
    );
    bins[binIndex]++;
  });

  // Update chart data
  histogramData.value = {
    labels: binLabels,
    datasets: [
      {
        label: t('frequency'),
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(52, 152, 219, 0.9)',
        data: bins
      }
    ]
  };
};

// Calculate statistics
const mean = computed(() => {
  if (sampleMeans.value.length === 0) return 0;
  return sampleMeans.value.reduce((sum, val) => sum + val, 0) / sampleMeans.value.length;
});

const stdDev = computed(() => {
  if (sampleMeans.value.length === 0) return 0;
  const meanVal = mean.value;
  const variance = sampleMeans.value.reduce((sum, val) => sum + Math.pow(val - meanVal, 2), 0) / sampleMeans.value.length;
  return Math.sqrt(variance);
});

watch(() => props.params, () => {
  runSimulation();
}, { deep: true });

onMounted(() => {
  runSimulation();
});
</script>

<template>
  <div class="central-limit-theorem">
    <h2>{{ t('centralLimitTheorem') }}</h2>
    <p class="description">
      {{ t('cltDescription', { distribution: t(params.distribution) }) }}
    </p>

    <div class="chart-container">
      <Bar
        :data="histogramData"
        :options="histogramOptions"
        :height="300"
      />
    </div>

    <div class="stats">
      <div class="stat-item">
        <strong>{{ t('distributionLabel') }}</strong> {{ t(params.distribution) }}
      </div>
      <div class="stat-item">
        <strong>{{ t('sampleSize') }}</strong> {{ params.sampleSize }}
      </div>
      <div class="stat-item">
        <strong>{{ t('meanOfSampleMeans') }}</strong> {{ mean.toFixed(4) }}
      </div>
      <div class="stat-item">
        <strong>{{ t('standardDeviationLabel') }}</strong> {{ stdDev.toFixed(4) }}
      </div>
      <div class="stat-item">
        <strong>{{ t('expectedStdDev') }}</strong>
        {{ (params.distribution === 'normal' ? (params.stdDev / Math.sqrt(params.sampleSize)).toFixed(4) : 'N/A') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.central-limit-theorem {
  display: flex;
  flex-direction: column;
}

h2 {
  margin-top: 0;
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.8rem;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 1.5px;
}

.description {
  margin-bottom: 25px;
  color: var(--text-light);
  line-height: 1.6;
  font-size: 1rem;
  max-width: 800px;
}

.chart-container {
  height: 450px;
  margin-bottom: 30px;
  padding: 15px;
  background-color: var(--bg-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: var(--transition);
}

.chart-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 25px;
  padding: 20px;
  background-color: var(--bg-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  position: relative;
  overflow: hidden;
}

.stats::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.stat-item {
  text-align: center;
  padding: 10px 15px;
  margin: 5px 10px;
  transition: var(--transition);
  flex: 1 1 150px;
  max-width: 200px;
}

.stat-item strong {
  display: block;
  margin-bottom: 8px;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .stats {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .stat-item {
    width: 100%;
    max-width: 100%;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding-bottom: 15px;
  }

  .stat-item:last-child {
    border-bottom: none;
  }
}
</style>
