// playground/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    nitro: {
        routeRules: {
            '/**': {
                headers: {
                    // COOP: allow popups/iframes (needed for GIS postMessage)
                    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',

                    // Don’t use COEP unless you truly need cross-origin isolation (see note below)
                    // 'Cross-Origin-Embedder-Policy': 'require-corp',

                    // Basic hardening
                    'Referrer-Policy': 'strict-origin-when-cross-origin',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'SAMEORIGIN',
                    // Only use HSTS on HTTPS with a stable domain (remove if on HTTP or during initial rollout)
                    // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

                    // CSP allowing GIS
                    // If you can, prefer nonces/hashes over 'unsafe-inline'. For most Nuxt apps,
                    // you’ll need 'unsafe-inline' unless you set up CSP nonces.
                    'Content-Security-Policy': [
                        "default-src 'self'",
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.gstatic.com",
                        "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
                        "img-src 'self' data: https://*.googleusercontent.com https://ssl.gstatic.com",
                        "font-src 'self' data:",
                        "connect-src 'self' https://www.googleapis.com https://accounts.google.com",
                        "frame-src https://accounts.google.com",
                        "base-uri 'self'",
                        "form-action 'self' https://accounts.google.com",
                        "frame-ancestors 'self'"
                    ].join('; ')
                }
            },

            // (Optional) tighter CSP for API-only responses
            '/api/**': {
                headers: {
                    'Content-Security-Policy': [
                        "default-src 'none'",
                        "connect-src 'self'",
                        "base-uri 'none'",
                        "frame-ancestors 'none'"
                    ].join('; ')
                }
            }
        }
    },
    modules: [
        // During dev, point to your local module source instead of npm
        '../src/module'
    ],
    googleAuth: {
        clientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
        promptOneTap: false,      // set true if you want One Tap
        autoLoadScript: true,      // injects the GIS script tag automatically
        enableServerVerify: true
    }
})
