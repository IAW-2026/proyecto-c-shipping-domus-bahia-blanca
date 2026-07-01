import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/api/admin(.*)',
  '/api/agentes(.*)',
  '/api/turnos/comprador(.*)',
  '/api/turnos/inmobiliaria(.*)',
  '/api/weather(.*)',
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isCuentaEnRevisionRoute = createRouteMatcher(['/cuenta-en-revision(.*)'])
const isPedirTurnosRoute = createRouteMatcher(['/pedirturnos(.*)'])
const isgracias = createRouteMatcher(['/gracias(.*)'])

export default clerkMiddleware(async (auth, req) => {

  if (isPublicRoute(req)) return NextResponse.next()

  const { userId, sessionClaims } = await auth()

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', `${req.nextUrl.pathname}${req.nextUrl.search}`)
    return NextResponse.redirect(signInUrl)
  }

  const roles = (sessionClaims?.metadata as { roles?: string[] })?.roles ?? []

  // Autenticado pero sin rol agente → onboarding
  if (!roles.includes('agente')) {
    if (isPedirTurnosRoute(req) || isCuentaEnRevisionRoute(req)|| isgracias(req)) {
      return NextResponse.next()
    }

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
