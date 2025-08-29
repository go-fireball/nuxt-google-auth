<!-- /src/runtime/components/GoogleLoginButton.ts -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const btn = ref<HTMLElement | null>(null)

function renderNow() {
  console.log('renderNow')
  console.log('btn', btn.value)
  if (!btn.value) return
  // @ts-ignore
  const google = (window as any).google
  console.log('google', google)
  if (!google?.accounts?.id) {
    // SDK not ready yet; will render on 'ready' event
    return
  }
  // call your composable’s renderer
  const { renderButton } = useGoogleAuth()
  renderButton(btn.value, { theme: 'filled_blue', size: 'large' })
}

function onReady() {
  console.log('onReady')
  renderNow()
}

onMounted(() => {
  console.log('onMounted')
  renderNow() // try immediately in case SDK is already initialized

  window.addEventListener('nuxt-google-auth:ready', onReady)
})

onBeforeUnmount(() => {
  console.log('onBeforeUnmount')
  window.removeEventListener('nuxt-google-auth:ready', onReady)
})
</script>

<template>
  <div ref="btn" />
</template>
