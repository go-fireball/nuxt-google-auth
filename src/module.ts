import {
    defineNuxtModule,
    addPlugin,
    addImports,
    createResolver,
    addServerHandler,
    addComponent,
    addImportsDir
} from '@nuxt/kit'


// src/module.ts
export interface ModuleOptions {
    clientId?: string
    autoLoadScript?: boolean
    promptOneTap?: boolean
    enableServerVerify?: boolean   // ← new
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: 'nuxt-google-auth',
        configKey: 'googleAuth',
        compatibility: {nuxt: '^3.0.0 || ^4.0.0'}
    },
    defaults: {
        clientId: '',
        autoLoadScript: true,
        promptOneTap: false,
        enableServerVerify: false,
    },
    setup(options, nuxt) {
        const {resolve} = createResolver(import.meta.url)

        nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}

        nuxt.options.runtimeConfig.public.googleAuth = {
            clientId: options.clientId || '',
            promptOneTap: options.promptOneTap || false,
            // expose a hint for the composable
            enableServerVerify: !!options.enableServerVerify
        }

        addPlugin({src: resolve('./runtime/plugin.client'), mode: 'client'})
        // addImports({from: resolve('./runtime/composables/useGoogleAuth'), name: 'useGoogleAuth'})
        addImportsDir(resolve('./runtime/composables'))
        // Auto-register <GoogleLoginButton />
        addComponent({name: 'GoogleLoginButton', filePath: resolve('./runtime/components/GoogleLoginButton.vue')})

        // only add the API route if enabled
        if (options.enableServerVerify) {
            addServerHandler({
                route: '/api/auth/google/verify',
                handler: resolve('./runtime/server/api/auth/google.verify.post')
            })
        }

        if (options.autoLoadScript) {
            nuxt.hook('app:templatesGenerated', () => {
                nuxt.options.app.head = nuxt.options.app.head || {}
                const scripts = nuxt.options.app.head.script || []
                const hasGIS = scripts.some((s: any) => typeof s === 'object' && s.src?.includes('accounts.google.com/gsi/client'))
                if (!hasGIS) {
                    scripts.push({src: 'https://accounts.google.com/gsi/client', async: true, defer: true})
                    nuxt.options.app.head.script = scripts
                }
            })
        }
    }
})