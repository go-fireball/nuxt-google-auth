# nuxt-google-auth

Google Identity Services integration for Nuxt 3 & 4 with a simple composable and ready-to-use login button component.

## Features

- 🔑 Easy Google Sign-In with the new Google Identity Services SDK

- 📦 Works in both Nuxt 3 and Nuxt 4

- 🎨 <GoogleLoginButton /> component with sensible defaults

- ⚡ Simple composable useGoogleAuth() for handling tokens and user info

- 🔒 Server API endpoint helper for verifying ID tokens with jose

## 📦 Installation

```shell
    npm install nuxt-google-auth
    # or
    yarn add nuxt-google-auth
    # or
    pnpm add nuxt-google-auth
```
Create a .env (or .env.local) with your Web client ID:

```ini
NUXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## ⚙️ Setup

Add the module to your Nuxt config:

```ts
// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    modules: ['nuxt-google-auth'],

    googleAuth: {
        clientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
        autoLoadScript: true,         // load Google script automatically
        promptOneTap: true,           // show One Tap prompt
        enableServerVerify: true      // enable server-side token verification endpoint
    }
})
```
## 🚀 Usage

### Login Button (recommended)

```vue
<template>
  <div style="display:grid;place-items:center;height:80vh;gap:16px;">
    <ClientOnly>
      <GoogleLoginButton
          :verify-on-server="true"
          :options="{ theme: 'filled_blue', size: 'large' }"
          @success="onSuccess"
          @verified="onVerified"
          @error="onError"
      />
    </ClientOnly>
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
```
#### Notes

- `@success` fires with `{ credential, claims }` as soon as Google returns an ID token.

- `:verify-on-server="true"` calls `/api/auth/google/verify` and then emits `@verified` with the server result.

- Omit `verify-on-server` if you want to handle verification yourself.

- The Google button renders via Google Identity Services, so it must be client-only. Wrap it in `<ClientOnly>` (as shown above) if it can render on the server.

#### Props

- options?: Record<string, any> — passed to Google renderButton (theme, size, text, shape, width, etc.)

- verifyOnServer?: boolean — default false.

#### Events

- success — { credential: string; claims: any }

- verified — server response (when verifyOnServer is true)

- error — any thrown error

#### Button options examples

```vue
<ClientOnly>
  <GoogleLoginButton
    :options="{ theme: 'outline', size: 'large', text: 'continue_with' }"
    @success="onSuccess"
    @error="onError"
  />

  <GoogleLoginButton
    :options="{ theme: 'filled_black', size: 'medium', text: 'signup_with' }"
    @success="onSuccess"
    @error="onError"
  />

  <GoogleLoginButton
    :options="{ theme: 'filled_blue', size: 'small', shape: 'pill', text: 'signin_with' }"
    @success="onSuccess"
    @error="onError"
  />
</ClientOnly>
```

### Composable (optional, advanced)

Use this if you want your own UI (no provided button) or custom flows:

```vue
<script setup lang="ts">
  const { credential, payload, renderButton, verifyOnServer } = useGoogleAuth()
</script>

<template>
  <div ref="el" />
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  const el = ref<HTMLElement | null>(null)
  const { renderButton, payload, verifyOnServer } = useGoogleAuth()

  onMounted(() => {
    if (el.value) {
      renderButton(el.value, { theme: 'outline', size: 'large' })
    }
  })

  watch(payload, async (claims) => {
    if (!claims) return
    // optional server verification
    const { data } = await verifyOnServer()
    console.log('claims:', claims, 'verified:', data)
  })
</script>

```
#### Composable API
- credential: Ref<string|null> — the raw ID token

- payload: Ref<any|null> — decoded claims (name, email, picture, sub, …)

- renderButton(el, options?) — renders the Google Sign-In button into an element

- verifyOnServer() — POSTs the current token to /api/auth/google/verify (if enabled)


## 🛠️ Playground
This repo includes a playground/ Nuxt app so you can test locally:

```shell
    npm install
    npm dev
```
Open http://localhost:3000 to try out the login flow.

## 📖 Configuration

- runtimeConfig.public.googleClientId → Your OAuth 2.0 Client ID from Google Cloud Console.

You can place it in a .env file:

```shell
NUXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
## 🤝 Contributing
PRs and issues are welcome! Please open an issue if you run into a bug or need a feature.

## 📄 License
[MIT](LICENSE)
