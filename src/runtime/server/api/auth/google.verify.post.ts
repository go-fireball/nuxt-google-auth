// src/runtime/server/api/auth/google.verify.post.ts
import { defineEventHandler, readBody } from 'h3'
import * as jose from 'jose'


export default defineEventHandler(async (event) => {
    const { credential } = await readBody<{ credential?: string }>(event)
    if (!credential) {
        return { ok: false, reason: 'missing_credential' }
    }
    const runtime = useRuntimeConfig()
    const aud = (runtime.public as any)?.googleAuth?.clientId as string | undefined

    try {
        // Fetch Google’s JSON Web Key Set and verify the JWT
        const JWKS = jose.createRemoteJWKSet(
            new URL('https://www.googleapis.com/oauth2/v3/certs')
        )

        const { payload } = await jose.jwtVerify(credential, JWKS, {
            audience: aud,
            issuer: 'https://accounts.google.com',
        })

        // Return a safe subset of the claims
        return {
            ok: true,
            sub: payload.sub,       // Google user ID
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        }
    } catch (err: any) {
        return {
            ok: false,
            reason: 'invalid_token',
            message: err?.message || 'Verification failed',
        }
    }
})
