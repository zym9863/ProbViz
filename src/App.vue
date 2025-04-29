<script setup lang="ts">
import { ref, provide } from 'vue';
import ProbabilitySimulator from './components/ProbabilitySimulator.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import { defaultLocale } from './i18n';
import { t } from './i18n/utils';

// 当前语言
const currentLocale = ref(defaultLocale);

// 提供给所有子组件的翻译函数
const translate = (key: string, params: Record<string, any> = {}) => {
  return t(currentLocale.value, key, params);
};

// 更改语言
const changeLocale = (locale: string) => {
  currentLocale.value = locale;
};

// 通过provide/inject机制提供给所有子组件
provide('locale', currentLocale);
provide('t', translate);
</script>

<template>
  <div class="app">
    <LanguageSwitcher
      :current-locale="currentLocale"
      @change-locale="changeLocale"
    />
    <ProbabilitySimulator />
  </div>
</template>

<style>
:root {
  --primary-color: #3498db;
  --primary-dark: #2980b9;
  --secondary-color: #2ecc71;
  --secondary-dark: #27ae60;
  --accent-color: #e74c3c;
  --text-color: #2c3e50;
  --text-light: #7f8c8d;
  --bg-color: #f8f9fa;
  --bg-card: #ffffff;
  --bg-control: #ecf0f1;
  --border-radius: 8px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

body {
  margin: 0;
  font-family: 'Segoe UI', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--bg-color);
  line-height: 1.6;
}

.app {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

button {
  cursor: pointer;
  font-family: inherit;
  transition: var(--transition);
}

input, select {
  font-family: inherit;
  transition: var(--transition);
}

@media (min-width: 1024px) {
  .app {
    padding: 40px;
  }
}
</style>
