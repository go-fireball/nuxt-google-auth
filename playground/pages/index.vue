<!-- /playground/pages/index.vue-->
<script setup lang="ts">
import { watch } from 'vue'

const { payload, verifyOnServer } = useGoogleAuth()


watch(payload, async (p) => {
  if (!p) return
  console.log('Google payload', p)
  const { data } = await verifyOnServer()
  console.log('Server verify', data)
})
</script>


<template>
  <div style="display:grid;place-items:center;height:80vh;gap:16px;">
    <button>sdfads</button>
    <client-only><GoogleLoginButton>Login </GoogleLoginButton> </client-only>
    <p>Open console to see payload + server verify.</p>
  </div>
</template>