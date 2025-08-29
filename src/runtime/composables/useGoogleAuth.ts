// src/runtime/composables/useGoogleAuth.ts
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {useFetch} from "nuxt/app";

/**
 * Composable for working with Google Identity Services.
 *
 * - `credential`: raw ID token string
 * - `payload`: decoded JWT claims (name, email, picture, etc.)
 * - `renderButton(el, opts)`: helper to render a Google Sign-In button
 * - `verifyOnServer()`: call /api/auth/google/verify to validate the token securely
 */
export function useGoogleAuth() {
    const credential = ref<string | null>(null)
    const payload = ref<any | null>(null)

    function decodeJwt(token: string) {
        const base64 = token.split('.')[1]
        const padded = base64.replace(/-/g, '+').replace(/_/g, '/')
        const json = atob(padded)
        try {
            return JSON.parse(decodeURIComponent(escape(json)))
        } catch {
            return JSON.parse(json)
        }
    }

    function renderButton(el: HTMLElement, opts: Record<string, any> = {}) {
        // @ts-ignore global from GIS
        const google = (window as any).google
        if (!google?.accounts?.id) return

        // Clear existing content so we don’t stack multiple buttons
        el.innerHTML = ''
        google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', ...opts })
    }

    async function verifyOnServer() {
        if (!credential.value) return { ok: false }
        try {
            const data = await $fetch('/api/auth/google/verify', {
                method: 'POST',
                body: { credential: credential.value }
            })
            return { data, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }


    const onCred = (e: Event) => {
        const detail = (e as CustomEvent).detail as { credential?: string }
        credential.value = detail?.credential || null
        payload.value = credential.value ? decodeJwt(credential.value) : null
    }

    if (import.meta.client) {
        onMounted(() => window.addEventListener('nuxt-google-auth:credential', onCred as any))
        onBeforeUnmount(() => window.removeEventListener('nuxt-google-auth:credential', onCred as any))
    }
    return { credential, payload, renderButton, verifyOnServer }
}
