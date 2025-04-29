<script setup lang="ts">
import { supportedLocales } from '../i18n';

const props = defineProps({
  currentLocale: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['change-locale']);

const changeLocale = (locale: string) => {
  emit('change-locale', locale);
};
</script>

<template>
  <div class="language-switcher">
    <select :value="currentLocale" @change="changeLocale($event.target.value)">
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  </div>
</template>

<style scoped>
.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

select {
  padding: 8px 30px 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  font-size: 14px;
  cursor: pointer;
  background-color: var(--bg-card);
  color: var(--text-color);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
}

select:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}
</style>
