import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin(() => {
    const cfg = useRuntimeConfig()
    const clientId = (cfg.public as any)?.googleAuth?.clientId as string | undefined
    const promptOneTap = !!(cfg.public as any)?.googleAuth?.promptOneTap

    if (!clientId) {
        console.warn('[nuxt-google-auth] Missing runtimeConfig.public.googleAuth.clientId')
        return
    }

    function injectScript(): Promise<void> {
        // Already present?
        const existing = document.querySelector<HTMLScriptElement>(
            'script[src^="https://accounts.google.com/gsi/client"]'
        )
        if (existing) {
            // If it already loaded earlier, resolve immediately after a tick
            return new Promise((r) => (existing.dataset.loaded ? r() : existing.addEventListener('load', () => r(), { once: true })))
        }

        return new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://accounts.google.com/gsi/client'
            s.async = true
            s.defer = true
            s.onload = () => {
                s.dataset.loaded = '1'
                resolve()
            }
            s.onerror = () => reject(new Error('Failed to load GIS script'))
            document.head.appendChild(s)
        })
    }

    function initGIS() {
        // @ts-ignore
        const google = (window as any).google
        if (!google?.accounts?.id) return false

        google.accounts.id.initialize({
            client_id: clientId,
            callback: (resp: any) => {
                window.dispatchEvent(new CustomEvent('nuxt-google-auth:credential', { detail: resp }))
            }
        })

        // let components know they can render the button
        window.dispatchEvent(new Event('nuxt-google-auth:ready'))

        if (promptOneTap) {
            google.accounts.id.prompt()
        }
        return true
    }

    ;(async () => {
        try {
            await injectScript()
            // wait a microtask so the global is attached
            Promise.resolve().then(() => {
                if (!initGIS()) {
                    // very defensive: if google isn’t attached yet, retry next frame
                    requestAnimationFrame(() => initGIS())
                }
            })
        } catch (e: any) {
            console.warn('[nuxt-google-auth] GIS not ready:', e?.message || e)
        }
    })()
})
