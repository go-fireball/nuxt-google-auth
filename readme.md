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

### Login Button Component

```vue

<template>
  <GoogleLoginButton
      :verify-on-server="true"
      :options="{ theme: 'filled_blue', size: 'large' }"
      @success="onSuccess"
      @verified="onVerified"
      @error="onError"> </GoogleLoginButton>
</template>
```
This automatically initializes Google Sign-In with your configured client ID.

### Composable

```ts

const onSuccess = (e: { credential: string; claims: any }) => {
    console.log('success:', e.claims, e.credential.slice(0, 20) + '…')
}

const onVerified = (data: any) => {
    console.log('verified:', data)
}

const onError = (err: any) => {
    console.error('error:', err)
}

```

### Server-side Token Verification
The module ships with a server API endpoint api/auth/google.verify that uses jose to validate Google ID tokens. You can customize or extend it as needed.

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
MIT