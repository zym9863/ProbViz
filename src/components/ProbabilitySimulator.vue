<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import LawOfLargeNumbers from './LawOfLargeNumbers.vue';
import CentralLimitTheorem from './CentralLimitTheorem.vue';
import ControlPanel from './ControlPanel.vue';

// 注入翻译函数
const t = inject('t') as (key: string, params?: Record<string, any>) => string;

const currentSimulation = ref('lawOfLargeNumbers'); // Default simulation
const simulationParams = ref({
  sampleSize: 100,
  numTrials: 1000,
  probability: 0.5,
  distribution: 'uniform',
  mean: 0,
  stdDev: 1,
});

const updateParams = (newParams: any) => {
  simulationParams.value = { ...simulationParams.value, ...newParams };
};

const changeSimulation = (simulation: string) => {
  currentSimulation.value = simulation;
};
</script>

<template>
  <div class="probability-simulator">
    <h1>{{ t('appTitle') }}</h1>

    <div class="simulation-selector">
      <button
        :class="{ active: currentSimulation === 'lawOfLargeNumbers' }"
        @click="changeSimulation('lawOfLargeNumbers')"
      >
        {{ t('lawOfLargeNumbers') }}
      </button>
      <button
        :class="{ active: currentSimulation === 'centralLimitTheorem' }"
        @click="changeSimulation('centralLimitTheorem')"
      >
        {{ t('centralLimitTheorem') }}
      </button>
    </div>

    <ControlPanel
      :simulation-type="currentSimulation"
      :params="simulationParams"
      @update-params="updateParams"
    />

    <div class="simulation-container">
      <LawOfLargeNumbers
        v-if="currentSimulation === 'lawOfLargeNumbers'"
        :params="simulationParams"
      />
      <CentralLimitTheorem
        v-else-if="currentSimulation === 'centralLimitTheorem'"
        :params="simulationParams"
      />
    </div>
  </div>
</template>

<style scoped>
.probability-simulator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color);
  font-weight: 600;
  font-size: 2.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
}

h1::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.simulation-selector {
  display: flex;
  justify-content: center;
  margin: 40px 0 30px;
  position: relative;
  z-index: 1;
}

.simulation-selector button {
  padding: 12px 24px;
  margin: 0 10px;
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--bg-card);
  color: var(--text-color);
  font-size: 16px;
  font-weight: 500;
  box-shadow: var(--box-shadow);
  position: relative;
  overflow: hidden;
}

.simulation-selector button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  z-index: -1;
}

.simulation-selector button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.simulation-selector button.active {
  background-color: var(--primary-color);
  color: white;
}

.simulation-container {
  margin-top: 30px;
  padding: 30px;
  border-radius: var(--border-radius);
  background-color: var(--bg-card);
  box-shadow: var(--box-shadow);
  transition: var(--transition);
}
</style>
