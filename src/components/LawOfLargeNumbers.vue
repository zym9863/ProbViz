<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue';
import { Chart, registerables } from 'chart.js';
import { Line } from 'vue-chartjs';

Chart.register(...registerables);

// 注入翻译函数
const t = inject('t') as (key: string, params?: Record<string, any>) => string;
const locale = inject('locale') as { value: string };

const props = defineProps({
  params: {
    type: Object,
    required: true
  }
});

const results = ref<number[]>([]);
const cumulativeAverage = ref<number[]>([]);
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: t('cumulativeAverage'),
      backgroundColor: 'rgba(66, 185, 131, 0.2)',
      borderColor: '#42b983',
      data: []
    },
    {
      label: t('trueProbability'),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: '#ff6384',
      data: [],
      borderDash: [5, 5]
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 1,
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
        text: 'Probability',
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
        text: 'Number of Trials',
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
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
        }
      }
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
      usePointStyle: true,
      callbacks: {
        label: function(context: any) {
          return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`;
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart'
  },
  elements: {
    line: {
      tension: 0.4
    },
    point: {
      radius: 0,
      hoverRadius: 6
    }
  }
});

const runSimulation = () => {
  results.value = [];
  cumulativeAverage.value = [];

  // Run the simulation
  for (let i = 0; i < props.params.numTrials; i++) {
    let successCount = 0;

    // Perform the experiment sampleSize times
    for (let j = 0; j < props.params.sampleSize; j++) {
      if (Math.random() < props.params.probability) {
        successCount++;
      }
    }

    // Calculate the proportion of successes
    const proportion = successCount / props.params.sampleSize;
    results.value.push(proportion);

    // Calculate the cumulative average
    let sum = 0;
    for (let k = 0; k <= i; k++) {
      sum += results.value[k];
    }
    cumulativeAverage.value.push(sum / (i + 1));
  }

  updateChart();
};

const updateChart = () => {
  const labels = Array.from({ length: results.value.length }, (_, i) => i + 1);
  const trueProb = Array(results.value.length).fill(props.params.probability);

  chartData.value = {
    labels,
    datasets: [
      {
        label: t('cumulativeAverage'),
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderColor: 'rgba(52, 152, 219, 0.8)',
        data: cumulativeAverage.value,
        fill: true,
        pointBackgroundColor: 'rgba(52, 152, 219, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(52, 152, 219, 1)',
        pointHoverRadius: 6,
        pointHitRadius: 10
      },
      {
        label: t('trueProbability'),
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        borderColor: 'rgba(231, 76, 60, 0.8)',
        data: trueProb,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0
      }
    ]
  };
};

watch(() => props.params, () => {
  runSimulation();
}, { deep: true });

onMounted(() => {
  runSimulation();
});
</script>

<template>
  <div class="law-of-large-numbers">
    <h2>{{ t('lawOfLargeNumbers') }}</h2>
    <p class="description">
      {{ t('lolnDescription', { probability: params.probability }) }}
    </p>

    <div class="chart-container">
      <Line
        :data="chartData"
        :options="chartOptions"
        :height="300"
      />
    </div>

    <div class="stats">
      <div class="stat-item">
        <strong>{{ t('trueProbability') }}</strong> {{ params.probability }}
      </div>
      <div class="stat-item">
        <strong>{{ t('finalAverage') }}</strong> {{ cumulativeAverage.length > 0 ? cumulativeAverage[cumulativeAverage.length - 1].toFixed(4) : 'N/A' }}
      </div>
      <div class="stat-item">
        <strong>{{ t('difference') }}</strong>
        {{ cumulativeAverage.length > 0 ? Math.abs(cumulativeAverage[cumulativeAverage.length - 1] - params.probability).toFixed(4) : 'N/A' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.law-of-large-numbers {
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
  transition: var(--transition);
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
    gap: 15px;
  }

  .stat-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding-bottom: 15px;
  }

  .stat-item:last-child {
    border-bottom: none;
  }
}
</style>
