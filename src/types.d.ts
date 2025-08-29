// src/types.d.ts
import type { ModuleOptions } from './module'

declare module 'nuxt/schema' {
    interface NuxtConfig {
        /** Options for nuxt-google-auth */
        googleAuth?: ModuleOptions
    }
    interface NuxtOptions {
        googleAuth?: ModuleOptions
    }
}

export {}
