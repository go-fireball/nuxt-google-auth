<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useGoogleAuth } from '../composables/useGoogleAuth'

type VerifyResult = { ok: boolean; [k: string]: any }

const props = withDefaults(
    defineProps<{
      /**
       * Options passed directly to google.accounts.id.renderButton
       * (theme, size, text, shape, width, logo_alignment, etc.)
       */
      options?: Record<string, any>

      /** If true, calls /api/auth/google/verify and emits "verified" */
      verifyOnServer?: boolean

      /** Minimum width (px) used when visible */
      minWidth?: number

      /** Maximum width (px) used (Google commonly clamps around ~400px) */
      maxWidth?: number

      /** Debounce delay to avoid flicker during resize/layout changes */
      debounceMs?: number
    }>(),
    {
      options: () => ({ theme: 'filled_blue', size: 'large', shape: 'rectangular' }),
      verifyOnServer: false,
      minWidth: 200,
      maxWidth: 400,
      debounceMs: 100
    }
)

const emit = defineEmits<{
  (e: 'success', payload: { credential: string; claims: any }): void
  (e: 'verified', payload: VerifyResult): void
  (e: 'error', err: any): void
}>()

const el = ref<HTMLElement | null>(null)
const ro = ref<ResizeObserver | null>(null)
let t: ReturnType<typeof setTimeout> | null = null

const { renderButton, payload, credential, verifyOnServer: verify } = useGoogleAuth()

function gisReady(): boolean {
  const google = (window as any).google
  return !!google?.accounts?.id
}

function renderNow() {
  if (!el.value) return
  if (!gisReady()) return

  const containerWidth = el.value.clientWidth || 0

  // Hidden/not laid out yet (tabs, v-show=false, collapsed containers): skip.
  // ResizeObserver (or later ticks) will render once width becomes > 0.
  if (containerWidth <= 0) return

  const userWidth = props.options?.width
  const autoWidth = Math.min(Math.max(containerWidth, props.minWidth), props.maxWidth)

  const opts = {
    ...(props.options || {}),
    width: typeof userWidth === 'number' ? userWidth : autoWidth
  }

  // renderButton() owns clearing & rendering (avoids duplicate clears here)
  renderButton(el.value, opts)
}

function scheduleRender() {
  if (t) clearTimeout(t)
  t = setTimeout(renderNow, props.debounceMs)
}

function onReady() {
  nextTick(scheduleRender)
}

onMounted(() => {
  // Attempt immediately (in case SDK already loaded)
  nextTick(scheduleRender)

  // Attempt again when the module signals GIS is ready
  window.addEventListener('nuxt-google-auth:ready', onReady)

  // Track layout changes for responsive sizing
  if (window.ResizeObserver) {
    ro.value = new ResizeObserver(() => scheduleRender())
    if (el.value) ro.value.observe(el.value)
  } else {
    window.addEventListener('resize', scheduleRender)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('nuxt-google-auth:ready', onReady)
  ro.value?.disconnect()
  window.removeEventListener('resize', scheduleRender)
  if (t) clearTimeout(t)
})

watch(
    () => props.options,
    () => nextTick(scheduleRender),
    { deep: true }
)

// When composable receives a new credential, emit success (and optionally verify).
watch(payload, async (claims) => {
  try {
    if (!claims || !credential.value) return

    emit('success', { credential: credential.value, claims })

    if (props.verifyOnServer) {
      const { data, error } = await verify()
      if (error) emit('error', error)
      else if (data) emit('verified', data as VerifyResult)
    }
  } catch (err) {
    emit('error', err)
  }
})
</script>

<template>
  <!-- Framework-agnostic: no dependency on Vuetify/Tailwind classes -->
  <div
      ref="el"
      :style="{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      minHeight: '44px'
    }"
  />
</template>
