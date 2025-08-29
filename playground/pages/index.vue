<!-- playground/pages/index.vue -->
<template>
  <div style="display:grid;place-items:center;height:80vh;gap:16px;">
    <GoogleLoginButton
        :verify-on-server="true"
        :options="{ theme: 'filled_blue', size: 'large' }"
        @success="onSuccess"
        @verified="onVerified"
        @error="onError"
    />
    <p>Open console to see events.</p>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line no-console
const onSuccess = (e: { credential: string; claims: any }) => {
  console.log('success:', e.claims, e.credential.slice(0, 20) + '…')
}
// eslint-disable-next-line no-console
const onVerified = (data: any) => {
  console.log('verified:', data)
}
// eslint-disable-next-line no-console
const onError = (err: any) => {
  console.error('error:', err)
}
</script>
