import { createAuthClient } from '@neon/auth'

export type NeonUser = { id: string; name: string; email: string }
const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim().replace(/\/$/, '')
// This public service URL is safe for the browser. OAuth and AI secrets stay server-side.
export const neonAuth = authUrl ? createAuthClient(authUrl) : null
export const authSetupMessage = 'Sign-in is being set up. You can explore the demo while your workspace gets ready.'
export function authErrorMessage(error: unknown) {
  return error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
    ? error.message : 'We couldn’t connect. Please try again.'
}
