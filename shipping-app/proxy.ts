import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhooks/clerk(.*)',
  '/api/agentes/confirmar(.*)',
  '/api/agentes/pendientes(.*)',
])

const isUnprotectedRoute = createRouteMatcher([
  '/api/agentes/estado(.*)',
  '/api/agentes/perfil(.*)',
  '/api/inmobiliarias(.*)',
  '/cuenta-en-revision(.*)',
  '/cuenta-rechazada(.*)',
  '/onboarding(.*)',
  '/unauthorized(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const isRootPath = req.nextUrl.pathname === '/'

  if (isPublicRoute(req) && !isRootPath) return NextResponse.next()

  const { userId, sessionClaims } = await auth()

  // No autenticado
  if (!userId) {
    if (isRootPath) return NextResponse.next()
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Rutas que no necesitan verificación de rol ni estado
  if (isUnprotectedRoute(req)) return NextResponse.next()

  // Verificar rol agente
  const roles = (sessionClaims?.metadata as { roles?: string[] })?.roles ?? []

  if (!roles.includes('agente')) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // Verificar estado del agente
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
      if (data.estado === 'COMPLETAR') {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
      if (data.estado === 'ACEPTADO') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
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