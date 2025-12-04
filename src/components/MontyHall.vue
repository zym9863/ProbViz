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

// 模拟结果数据
const stayResults = ref<number[]>([]);
const switchResults = ref<number[]>([]);
const cumulativeStayProbability = ref<number[]>([]);
const cumulativeSwitchProbability = ref<number[]>([]);

// 图表数据
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: t('stayStrategy'),
      backgroundColor: 'rgba(231, 76, 60, 0.2)', // 红色
      borderColor: 'rgba(231, 76, 60, 0.8)',
      data: [],
      fill: true,
      tension: 0.4
    },
    {
      label: t('switchStrategy'),
      backgroundColor: 'rgba(52, 152, 219, 0.2)', // 蓝色
      borderColor: 'rgba(52, 152, 219, 0.8)',
      data: [],
      fill: true,
      tension: 0.4
    },
    {
      label: t('theoreticalStayProbability'),
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      borderColor: 'rgba(231, 76, 60, 0.5)',
      data: [],
      borderDash: [5, 5],
      pointRadius: 0,
      tension: 0
    },
    {
      label: t('theoreticalSwitchProbability'),
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      borderColor: 'rgba(52, 152, 219, 0.5)',
      data: [],
      borderDash: [5, 5],
      pointRadius: 0,
      tension: 0
    }
  ]
});

// 图表配置选项
const chartOptions = ref<any>({
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
        },
        callback: function(value: any) {
          return (value * 100).toFixed(0) + '%';
        }
      },
      title: {
        display: true,
        text: 'Winning Probability',
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
          return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(2)}%`;
        }
      }
    }
  }
});

/**
 * 执行单次三门问题模拟
 * @returns {Object} 包含坚持和更换策略结果的对象
 */
const runSingleTrial = () => {
  // 随机选择正确的门（1-3）
  const correctDoor = Math.floor(Math.random() * 3) + 1;

  // 玩家随机选择初始门
  const playerInitialChoice = Math.floor(Math.random() * 3) + 1;

  // 主持人打开一扇错误的门
  let hostOpenedDoor;
  do {
    hostOpenedDoor = Math.floor(Math.random() * 3) + 1;
  } while (hostOpenedDoor === correctDoor || hostOpenedDoor === playerInitialChoice);

  // 计算两种策略的结果
  const stayWins = playerInitialChoice === correctDoor;

  // 更换策略：选择剩下的那扇门
  let switchChoice;
  do {
    switchChoice = Math.floor(Math.random() * 3) + 1;
  } while (switchChoice === playerInitialChoice || switchChoice === hostOpenedDoor);

  const switchWins = switchChoice === correctDoor;

  return { stayWins, switchWins };
};

/**
 * 运行完整的三门问题模拟
 */
const runSimulation = () => {
  stayResults.value = [];
  switchResults.value = [];
  cumulativeStayProbability.value = [];
  cumulativeSwitchProbability.value = [];

  let stayWinCount = 0;
  let switchWinCount = 0;

  // 运行指定次数的试验
  for (let i = 0; i < props.params.numTrials; i++) {
    const trialResult = runSingleTrial();

    // 记录单次试验结果（1表示获胜，0表示失败）
    stayResults.value.push(trialResult.stayWins ? 1 : 0);
    switchResults.value.push(trialResult.switchWins ? 1 : 0);

    // 更新获胜计数
    if (trialResult.stayWins) stayWinCount++;
    if (trialResult.switchWins) switchWinCount++;

    // 计算累积获胜概率
    const stayProbability = stayWinCount / (i + 1);
    const switchProbability = switchWinCount / (i + 1);

    cumulativeStayProbability.value.push(stayProbability);
    cumulativeSwitchProbability.value.push(switchProbability);
  }

  // 更新图表数据
  updateChart();
};

/**
 * 更新图表数据
 */
const updateChart = () => {
  // 创建X轴标签（试验次数）
  const labels = Array.from({ length: stayResults.value.length }, (_, i) => i + 1);

  // 理论概率值
  const theoreticalStayProbability = Array(stayResults.value.length).fill(1/3);
  const theoreticalSwitchProbability = Array(stayResults.value.length).fill(2/3);

  // 更新图表数据
  chartData.value = {
    labels,
    datasets: [
      {
        label: t('stayStrategy'),
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        borderColor: 'rgba(231, 76, 60, 0.8)',
        data: cumulativeStayProbability.value as any[],
        fill: true,
        tension: 0.4
      },
      {
        label: t('switchStrategy'),
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderColor: 'rgba(52, 152, 219, 0.8)',
        data: cumulativeSwitchProbability.value as any[],
        fill: true,
        tension: 0.4
      },
      {
        label: t('theoreticalStayProbability'),
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderColor: 'rgba(231, 76, 60, 0.5)',
        data: theoreticalStayProbability as any[],
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0
      },
      {
        label: t('theoreticalSwitchProbability'),
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderColor: 'rgba(52, 152, 219, 0.5)',
        data: theoreticalSwitchProbability as any[],
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0
      }
    ]
  } as any;
};

// 监听参数变化，重新运行模拟
watch(() => props.params, () => {
  runSimulation();
}, { deep: true });

// 组件挂载时运行初始模拟
onMounted(() => {
  runSimulation();
});
</script>

<template>
  <div class="monty-hall-problem">
    <h2>{{ t('montyHallProblem') }}</h2>
    <p class="description">
      {{ t('montyHallDescription') }}
    </p>

    <div class="chart-container">
      <Line
        :data="chartData"
        :options="chartOptions"
        :height="300"
      />
    </div>

    <div class="stats">
      <div class="stat-group">
        <h3>{{ t('stayStrategy') }}</h3>
        <div class="stat-item">
          <strong>{{ t('theoreticalStayProbability') }}</strong>
          {{ (1/3 * 100).toFixed(2) }}%
        </div>
        <div class="stat-item">
          <strong>{{ t('finalStayProbability') }}</strong>
          {{ cumulativeStayProbability.length > 0 ? (cumulativeStayProbability[cumulativeStayProbability.length - 1] * 100).toFixed(4) : 'N/A' }}%
        </div>
      </div>

      <div class="stat-group">
        <h3>{{ t('switchStrategy') }}</h3>
        <div class="stat-item">
          <strong>{{ t('theoreticalSwitchProbability') }}</strong>
          {{ (2/3 * 100).toFixed(2) }}%
        </div>
        <div class="stat-item">
          <strong>{{ t('finalSwitchProbability') }}</strong>
          {{ cumulativeSwitchProbability.length > 0 ? (cumulativeSwitchProbability[cumulativeSwitchProbability.length - 1] * 100).toFixed(4) : 'N/A' }}%
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monty-hall-problem {
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 25px;
}

.stat-group {
  padding: 20px;
  background-color: var(--bg-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  position: relative;
  overflow: hidden;
  transition: var(--transition);
}

.stat-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-group:nth-child(1) {
  border-top: 3px solid #e74c3c; /* 红色顶部边框 */
}

.stat-group:nth-child(2) {
  border-top: 3px solid #3498db; /* 蓝色顶部边框 */
}

.stat-group h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.2rem;
  text-align: center;
}

.stat-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: var(--transition);
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-item:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transform: scale(1.02);
}

.stat-item strong {
  display: block;
  margin-bottom: 5px;
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.stat-item span {
  color: var(--primary-color);
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stat-group h3 {
    font-size: 1.1rem;
  }
}
</style>
