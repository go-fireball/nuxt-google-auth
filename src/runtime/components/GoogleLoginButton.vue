<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useGoogleAuth } from '../composables/useGoogleAuth'
/**
 * Props:
 * - options: GIS render options (theme, size, shape, text, width, logo_alignment, etc.)
 * - verifyOnServer: if true, calls /api/auth/google/verify and emits "verified"
 */
const props = withDefaults(defineProps<{
  options?: Record<string, any>
  verifyOnServer?: boolean
}>(), {
  options: () => ({ theme: 'filled_blue', size: 'large' }),
  verifyOnServer: false
})

const emit = defineEmits<{
  (e: 'success', payload: { credential: string; claims: any }): void
  (e: 'verified', payload: { ok: boolean; [k: string]: any }): void
  (e: 'error', err: any): void
}>()

const el = ref<HTMLElement | null>(null)
const { renderButton, payload, credential, verifyOnServer } = useGoogleAuth()

function tryRender() {
  if (!el.value) return
  // @ts-ignore
  const google = (window as any).google
  if (!google?.accounts?.id) return
  renderButton(el.value, props.options || {})
}

function onReady() {
  tryRender()
}

onMounted(() => {
  tryRender() // if SDK is already loaded
  window.addEventListener('nuxt-google-auth:ready', onReady)
})

onBeforeUnmount(() => {
  window.removeEventListener('nuxt-google-auth:ready', onReady)
})

/** When composable receives a new credential, emit success (and optionally verify). */
watch(payload, async (claims) => {
  try {
    if (!claims || !credential.value) return
    emit('success', { credential: credential.value, claims })

    if (props.verifyOnServer) {
      const { data, error } = await verifyOnServer()
      if (error) emit('error', error)
      else if (data) emit('verified', data as any)
    }
  } catch (err) {
    emit('error', err)
  }
})
</script>

<template>
  <div ref="el" />
</template>
