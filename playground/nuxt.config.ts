// playground/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2025-08-28',
    devtools:false,
    modules: [
        // During dev, point to your local module source instead of npm
        '../src/module'
    ],
    googleAuth: {
        clientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
        promptOneTap: true,      // set true if you want One Tap
        autoLoadScript: true,      // injects the GIS script tag automatically
        enableServerVerify: true
    }
})
