<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Success' },
  message: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const close = () => emit('close')
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal-card">
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-message">{{ message }}</p>
      <button class="modal-button" @click="close">OK</button>
    </div>
  </div>
  </template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10002;
}
.modal-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  text-align: center;
  position: relative;
  margin: auto;
}
.modal-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
.modal-message { font-size: 14px; margin-bottom: 16px; }
.modal-button {
  background: #009444;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
}
.modal-button:hover { opacity: 0.9; }
</style>