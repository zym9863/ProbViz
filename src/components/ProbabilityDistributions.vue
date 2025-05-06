<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue';
import { Chart, registerables } from 'chart.js';
import { Line } from 'vue-chartjs';

Chart.register(...registerables);

// 注入翻译函数和当前语言
const t = inject('t') as (key: string, params?: Record<string, any>) => string;
const locale = inject('locale') as { value: string };

// 当前选择的分布
const selectedDistribution = ref('normal');

// 分布参数
const distributionParams = ref({
  // 正态分布参数
  normal: {
    mean: 0,
    stdDev: 1
  },
  // 均匀分布参数
  uniform: {
    min: 0,
    max: 1
  },
  // 指数分布参数
  exponential: {
    lambda: 1
  },
  // 二项分布参数
  binomial: {
    n: 10,
    p: 0.5
  },
  // 泊松分布参数
  poisson: {
    lambda: 5
  }
});

// PDF 图表数据
const pdfChartData = ref({
  labels: [],
  datasets: [
    {
      label: 'PDF',
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      data: [],
      fill: true,
      tension: 0.4
    }
  ]
});

// CDF 图表数据
const cdfChartData = ref({
  labels: [],
  datasets: [
    {
      label: 'CDF',
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      data: [],
      fill: true,
      tension: 0.4
    }
  ]
});

// 图表配置
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'x'
      }
    },
    y: {
      title: {
        display: true,
        text: selectedDistribution.value === 'binomial' || selectedDistribution.value === 'poisson' ? 'P(X = x)' : 'f(x)'
      },
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          return `${label}: ${value.toFixed(4)}`;
        }
      }
    }
  }
}));

const cdfChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'x'
      }
    },
    y: {
      title: {
        display: true,
        text: 'F(x)'
      },
      beginAtZero: true,
      max: 1.05
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          return `${label}: ${value.toFixed(4)}`;
        }
      }
    }
  }
}));

// 计算正态分布的 PDF
function normalPDF(x, mean, stdDev) {
  const variance = stdDev * stdDev;
  return (1 / Math.sqrt(2 * Math.PI * variance)) * 
         Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
}

// 计算正态分布的 CDF (使用近似算法)
function normalCDF(x, mean, stdDev) {
  const z = (x - mean) / stdDev;
  // 使用近似算法计算标准正态分布的 CDF
  if (z < -6) return 0;
  if (z > 6) return 1;
  
  let sum = 0;
  let term = z;
  let i = 3;
  
  while (Math.abs(term) > 1e-10) {
    sum += term;
    term = term * z * z / i;
    i += 2;
  }
  
  return 0.5 + sum * 0.3989422804014327; // 0.3989... = 1/sqrt(2*PI)
}

// 计算均匀分布的 PDF
function uniformPDF(x, min, max) {
  if (x < min || x > max) return 0;
  return 1 / (max - min);
}

// 计算均匀分布的 CDF
function uniformCDF(x, min, max) {
  if (x < min) return 0;
  if (x > max) return 1;
  return (x - min) / (max - min);
}

// 计算指数分布的 PDF
function exponentialPDF(x, lambda) {
  if (x < 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

// 计算指数分布的 CDF
function exponentialCDF(x, lambda) {
  if (x < 0) return 0;
  return 1 - Math.exp(-lambda * x);
}

// 计算二项分布的 PMF
function binomialPMF(k, n, p) {
  if (k < 0 || k > n) return 0;
  
  // 计算组合数 C(n,k)
  let coeff = 1;
  for (let i = 1; i <= k; i++) {
    coeff *= (n - (i - 1)) / i;
  }
  
  return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// 计算二项分布的 CDF
function binomialCDF(k, n, p) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binomialPMF(i, n, p);
  }
  return sum;
}

// 计算泊松分布的 PMF
function poissonPMF(k, lambda) {
  if (k < 0 || !Number.isInteger(k)) return 0;
  
  // 计算 lambda^k * e^(-lambda) / k!
  let result = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) {
    result *= lambda / i;
  }
  
  return result;
}

// 计算泊松分布的 CDF
function poissonCDF(k, lambda) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += poissonPMF(i, lambda);
  }
  return sum;
}

// 更新图表数据
function updateCharts() {
  let xValues = [];
  let pdfValues = [];
  let cdfValues = [];
  
  // 根据不同分布类型生成数据点
  if (selectedDistribution.value === 'normal') {
    const { mean, stdDev } = distributionParams.value.normal;
    // 生成 x 值范围 (mean - 4*stdDev 到 mean + 4*stdDev)
    const min = mean - 4 * stdDev;
    const max = mean + 4 * stdDev;
    const step = (max - min) / 100;
    
    for (let x = min; x <= max; x += step) {
      xValues.push(x);
      pdfValues.push(normalPDF(x, mean, stdDev));
      cdfValues.push(normalCDF(x, mean, stdDev));
    }
  } else if (selectedDistribution.value === 'uniform') {
    const { min, max } = distributionParams.value.uniform;
    // 生成 x 值范围 (min - 0.5 到 max + 0.5)
    const xMin = min - 0.5;
    const xMax = max + 0.5;
    const step = (xMax - xMin) / 100;
    
    for (let x = xMin; x <= xMax; x += step) {
      xValues.push(x);
      pdfValues.push(uniformPDF(x, min, max));
      cdfValues.push(uniformCDF(x, min, max));
    }
  } else if (selectedDistribution.value === 'exponential') {
    const { lambda } = distributionParams.value.exponential;
    // 生成 x 值范围 (0 到 5/lambda)
    const max = 5 / lambda;
    const step = max / 100;
    
    for (let x = 0; x <= max; x += step) {
      xValues.push(x);
      pdfValues.push(exponentialPDF(x, lambda));
      cdfValues.push(exponentialCDF(x, lambda));
    }
  } else if (selectedDistribution.value === 'binomial') {
    const { n, p } = distributionParams.value.binomial;
    // 生成 x 值范围 (0 到 n)
    for (let k = 0; k <= n; k++) {
      xValues.push(k);
      pdfValues.push(binomialPMF(k, n, p));
      cdfValues.push(binomialCDF(k, n, p));
    }
  } else if (selectedDistribution.value === 'poisson') {
    const { lambda } = distributionParams.value.poisson;
    // 生成 x 值范围 (0 到 lambda*2 + 10)
    const max = Math.min(Math.round(lambda * 2 + 10), 50); // 限制最大值为50
    
    for (let k = 0; k <= max; k++) {
      xValues.push(k);
      pdfValues.push(poissonPMF(k, lambda));
      cdfValues.push(poissonCDF(k, lambda));
    }
  }
  
  // 更新图表数据
  pdfChartData.value = {
    labels: xValues,
    datasets: [
      {
        label: 'PDF',
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        data: pdfValues,
        fill: true,
        tension: 0.4,
        pointRadius: selectedDistribution.value === 'binomial' || selectedDistribution.value === 'poisson' ? 3 : 0
      }
    ]
  };
  
  cdfChartData.value = {
    labels: xValues,
    datasets: [
      {
        label: 'CDF',
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        data: cdfValues,
        fill: true,
        tension: 0.4,
        pointRadius: selectedDistribution.value === 'binomial' || selectedDistribution.value === 'poisson' ? 3 : 0
      }
    ]
  };
}

// 监听分布类型和参数变化
watch(selectedDistribution, () => {
  updateCharts();
});

watch(() => distributionParams.value, () => {
  updateCharts();
}, { deep: true });

// 组件挂载时初始化图表
onMounted(() => {
  updateCharts();
});
</script>

<template>
  <div class="probability-distributions">
    <h2>{{ t('probabilityDistributions') }}</h2>
    <p class="description">
      {{ t('pdDescription') }}
    </p>

    <div class="distribution-selector">
      <label for="distribution">{{ t('distribution') }}</label>
      <select id="distribution" v-model="selectedDistribution">
        <option value="normal">{{ t('normal') }}</option>
        <option value="uniform">{{ t('uniform') }}</option>
        <option value="exponential">{{ t('exponential') }}</option>
        <option value="binomial">{{ t('binomial') }}</option>
        <option value="poisson">{{ t('poisson') }}</option>
      </select>
    </div>

    <div class="parameters-container">
      <!-- 正态分布参数 -->
      <div v-if="selectedDistribution === 'normal'" class="distribution-params">
        <h3>{{ t('normalDistParams') }}</h3>
        <div class="parameter">
          <label for="normal-mean">{{ t('mean') }}</label>
          <input
            id="normal-mean"
            type="range"
            v-model.number="distributionParams.normal.mean"
            min="-10"
            max="10"
            step="0.1"
          />
          <span>{{ distributionParams.normal.mean }}</span>
        </div>
        <div class="parameter">
          <label for="normal-stddev">{{ t('standardDeviation') }}</label>
          <input
            id="normal-stddev"
            type="range"
            v-model.number="distributionParams.normal.stdDev"
            min="0.1"
            max="5"
            step="0.1"
          />
          <span>{{ distributionParams.normal.stdDev }}</span>
        </div>
        <div class="parameter">
          <label>{{ t('variance') }}</label>
          <span>{{ (distributionParams.normal.stdDev * distributionParams.normal.stdDev).toFixed(2) }}</span>
        </div>
      </div>

      <!-- 均匀分布参数 -->
      <div v-if="selectedDistribution === 'uniform'" class="distribution-params">
        <h3>{{ t('uniformDistParams') }}</h3>
        <div class="parameter">
          <label for="uniform-min">{{ t('minValue') }}</label>
          <input
            id="uniform-min"
            type="range"
            v-model.number="distributionParams.uniform.min"
            min="-10"
            max="10"
            step="0.1"
            :max="distributionParams.uniform.max - 0.1"
          />
          <span>{{ distributionParams.uniform.min }}</span>
        </div>
        <div class="parameter">
          <label for="uniform-max">{{ t('maxValue') }}</label>
          <input
            id="uniform-max"
            type="range"
            v-model.number="distributionParams.uniform.max"
            min="-10"
            max="10"
            step="0.1"
            :min="distributionParams.uniform.min + 0.1"
          />
          <span>{{ distributionParams.uniform.max }}</span>
        </div>
      </div>

      <!-- 指数分布参数 -->
      <div v-if="selectedDistribution === 'exponential'" class="distribution-params">
        <h3>{{ t('exponentialDistParams') }}</h3>
        <div class="parameter">
          <label for="exponential-lambda">{{ t('lambda') }}</label>
          <input
            id="exponential-lambda"
            type="range"
            v-model.number="distributionParams.exponential.lambda"
            min="0.1"
            max="5"
            step="0.1"
          />
          <span>{{ distributionParams.exponential.lambda }}</span>
        </div>
        <div class="parameter">
          <label>{{ t('mean') }}</label>
          <span>{{ (1 / distributionParams.exponential.lambda).toFixed(2) }}</span>
        </div>
      </div>

      <!-- 二项分布参数 -->
      <div v-if="selectedDistribution === 'binomial'" class="distribution-params">
        <h3>{{ t('binomialDistParams') }}</h3>
        <div class="parameter">
          <label for="binomial-n">{{ t('trials') }}</label>
          <input
            id="binomial-n"
            type="range"
            v-model.number="distributionParams.binomial.n"
            min="1"
            max="50"
            step="1"
          />
          <span>{{ distributionParams.binomial.n }}</span>
        </div>
        <div class="parameter">
          <label for="binomial-p">{{ t('successProb') }}</label>
          <input
            id="binomial-p"
            type="range"
            v-model.number="distributionParams.binomial.p"
            min="0"
            max="1"
            step="0.01"
          />
          <span>{{ distributionParams.binomial.p }}</span>
        </div>
        <div class="parameter">
          <label>{{ t('mean') }}</label>
          <span>{{ (distributionParams.binomial.n * distributionParams.binomial.p).toFixed(2) }}</span>
        </div>
      </div>

      <!-- 泊松分布参数 -->
      <div v-if="selectedDistribution === 'poisson'" class="distribution-params">
        <h3>{{ t('poissonDistParams') }}</h3>
        <div class="parameter">
          <label for="poisson-lambda">{{ t('lambda') }}</label>
          <input
            id="poisson-lambda"
            type="range"
            v-model.number="distributionParams.poisson.lambda"
            min="0.1"
            max="20"
            step="0.1"
          />
          <span>{{ distributionParams.poisson.lambda }}</span>
        </div>
        <div class="parameter">
          <label>{{ t('mean') }}</label>
          <span>{{ distributionParams.poisson.lambda.toFixed(2) }}</span>
        </div>
        <div class="parameter">
          <label>{{ t('variance') }}</label>
          <span>{{ distributionParams.poisson.lambda.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div class="charts-container">
      <div class="chart-wrapper">
        <h3>{{ t('pdfTitle') }}</h3>
        <div class="chart">
          <Line
            :data="pdfChartData"
            :options="chartOptions"
            :height="250"
          />
        </div>
      </div>
      
      <div class="chart-wrapper">
        <h3>{{ t('cdfTitle') }}</h3>
        <div class="chart">
          <Line
            :data="cdfChartData"
            :options="cdfChartOptions"
            :height="250"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.probability-distributions {
  margin-top: 20px;
}

h2 {
  margin-bottom: 15px;
  color: var(--text-color);
}

.description {
  margin-bottom: 25px;
  color: var(--text-light);
  line-height: 1.6;
}

.distribution-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.distribution-selector label {
  margin-right: 10px;
  font-weight: 500;
}

.distribution-selector select {
  padding: 8px 30px 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  background-color: var(--bg-card);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

.parameters-container {
  margin-bottom: 30px;
  padding: 20px;
  background-color: var(--bg-control);
  border-radius: var(--border-radius);
}

.distribution-params h3 {
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: var(--text-color);
}

.parameter {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.parameter label {
  width: 150px;
  font-weight: 500;
}

.parameter input[type="range"] {
  flex: 1;
  margin: 0 15px;
}

.parameter span {
  width: 50px;
  text-align: right;
  font-weight: 500;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-wrapper {
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--box-shadow);
}

.chart-wrapper h3 {
  margin-bottom: 15px;
  text-align: center;
  color: var(--text-color);
}

.chart {
  height: 250px;
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}
</style>
