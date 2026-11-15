import { createClient } from '@supabase/supabase-js'

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
// Only public configuration enters this bundle. Provider secrets belong in Supabase.
export const supabase = projectUrl && publishableKey && !publishableKey.startsWith('sb_secret_')
  ? createClient(projectUrl, publishableKey, {
      auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
    })
  : null

export const authSetupMessage = 'Sign-in is being set up. You can explore the demo while your school workspace gets ready.'
