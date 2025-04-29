<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import { getLocalizedDistribution } from '../i18n/utils';

// 注入翻译函数和当前语言
const t = inject('t') as (key: string, params?: Record<string, any>) => string;
const locale = inject('locale') as { value: string };

const props = defineProps({
  simulationType: {
    type: String,
    required: true
  },
  params: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-params']);

const localParams = ref({ ...props.params });

watch(() => props.params, (newParams) => {
  localParams.value = { ...newParams };
}, { deep: true });

const updateParams = () => {
  emit('update-params', localParams.value);
};

const runSimulation = () => {
  updateParams();
};

// 获取本地化的分布名称
const getDistributionName = (distribution: string) => {
  return getLocalizedDistribution(locale.value, distribution);
};
</script>

<template>
  <div class="control-panel">
    <h2>{{ t('simulationParameters') }}</h2>

    <div class="parameter-group">
      <div class="parameter">
        <label for="sampleSize">{{ t('sampleSize') }}</label>
        <input
          id="sampleSize"
          type="number"
          v-model.number="localParams.sampleSize"
          min="1"
          max="10000"
        />
      </div>

      <div class="parameter">
        <label for="numTrials">{{ t('numberOfTrials') }}</label>
        <input
          id="numTrials"
          type="number"
          v-model.number="localParams.numTrials"
          min="1"
          max="10000"
        />
      </div>

      <template v-if="simulationType === 'lawOfLargeNumbers'">
        <div class="parameter">
          <label for="probability">{{ t('probability') }}</label>
          <input
            id="probability"
            type="range"
            v-model.number="localParams.probability"
            min="0"
            max="1"
            step="0.01"
          />
          <span>{{ localParams.probability }}</span>
        </div>
      </template>

      <template v-if="simulationType === 'centralLimitTheorem'">
        <div class="parameter">
          <label for="distribution">{{ t('distribution') }}</label>
          <select id="distribution" v-model="localParams.distribution">
            <option value="uniform">{{ t('uniform') }}</option>
            <option value="normal">{{ t('normal') }}</option>
            <option value="exponential">{{ t('exponential') }}</option>
            <option value="binomial">{{ t('binomial') }}</option>
          </select>
        </div>

        <div v-if="localParams.distribution === 'normal'" class="parameter">
          <label for="mean">{{ t('mean') }}</label>
          <input
            id="mean"
            type="number"
            v-model.number="localParams.mean"
            step="0.1"
          />
        </div>

        <div v-if="localParams.distribution === 'normal'" class="parameter">
          <label for="stdDev">{{ t('standardDeviation') }}</label>
          <input
            id="stdDev"
            type="number"
            v-model.number="localParams.stdDev"
            min="0.1"
            step="0.1"
          />
        </div>
      </template>
    </div>

    <button class="run-button" @click="runSimulation">{{ t('runSimulation') }}</button>
  </div>
</template>

<style scoped>
.control-panel {
  margin-bottom: 30px;
  padding: 25px;
  border-radius: var(--border-radius);
  background-color: var(--bg-card);
  box-shadow: var(--box-shadow);
  position: relative;
  overflow: hidden;
}

.control-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.5rem;
  position: relative;
  display: inline-block;
}

.parameter-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.parameter {
  display: flex;
  flex-direction: column;
  position: relative;
}

label {
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.95rem;
}

input, select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 14px;
  background-color: var(--bg-color);
  color: var(--text-color);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: var(--transition);
}

input:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

input[type="range"] {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
  padding: 0;
  margin: 10px 0;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

.parameter span {
  margin-top: 5px;
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 500;
}

.run-button {
  padding: 12px 24px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.run-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  z-index: 1;
}

.run-button:hover {
  background-color: var(--secondary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.run-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}
</style>
