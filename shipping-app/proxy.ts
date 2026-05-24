import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/agentes/confirmar(.*)',
  '/api/agentes/pendientes(.*)',
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])

export default clerkMiddleware(async (auth, req) => {

  if (isPublicRoute(req)) return NextResponse.next()

  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const roles = (sessionClaims?.metadata as { roles?: string[] })?.roles ?? []

  // Autenticado pero sin rol agente → onboarding
  if (!roles.includes('agente')) {
    if (!isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}