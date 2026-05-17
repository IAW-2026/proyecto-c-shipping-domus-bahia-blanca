import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/agentes/confirmar(.*)',
  '/api/agentes/pendientes(.*)',
])
const isStatusRoute = createRouteMatcher(['/api/agentes/estado(.*)'])
const isProfileRoute = createRouteMatcher(['/api/agentes/perfil(.*)'])
const isInmobiliariasRoute = createRouteMatcher(['/api/inmobiliarias(.*)'])
const isReviewRoute = createRouteMatcher(['/cuenta-en-revision(.*)'])
const isRejectedRoute = createRouteMatcher(['/cuenta-rechazada(.*)'])
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isUnauthorizedRoute = createRouteMatcher(['/unauthorized(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next()

  const { userId, sessionClaims } = await auth()

  // No autenticado
  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  // Provisorio:
  // Autenticado pero no es agente inmobiliario
  //TO-DO: Redirigir de manera correcta a otra pagina o mostrar advertencia.
  const metadata = sessionClaims?.publicMetadata as {
  roles?: string[]
}

  if (
    isStatusRoute(req) ||
    isProfileRoute(req) ||
    isInmobiliariasRoute(req) ||
    isReviewRoute(req) ||
    isRejectedRoute(req) ||
    isOnboardingRoute(req) ||
    isUnauthorizedRoute(req)
  ) {
    return NextResponse.next()
  }

  const roles = metadata?.roles ?? []

  if (!roles.includes('agente')) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  try {
    const statusUrl = new URL('/api/agentes/estado', req.url)
    const statusResponse = await fetch(statusUrl, {
      headers: {
        cookie: req.headers.get('cookie') ?? '',
      },
    })

    if (statusResponse.ok) {
      const data = (await statusResponse.json()) as { estado?: string }
      if (data.estado === 'RECHAZADO') {
        return NextResponse.redirect(new URL('/cuenta-rechazada', req.url))
      }
      if (data.estado === 'PENDIENTE') {
        return NextResponse.redirect(new URL('/cuenta-en-revision', req.url))
      }
      if (data.estado !== 'ACEPTADO') {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
    }
  } catch (error) {
    console.error(error)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}