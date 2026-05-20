import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  '/unauthorized(.*)',
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isCuentaRechazadaRoute = createRouteMatcher(['/cuenta-rechazada(.*)'])
const isCuentaRevisionRoute = createRouteMatcher(['/cuenta-en-revision(.*)'])
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const isRootPath = req.nextUrl.pathname === '/'

  if (isPublicRoute(req) && !isRootPath) return NextResponse.next()

  const { userId } = await auth()

  if (!userId) {
    if (isRootPath) return NextResponse.next()
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isUnprotectedRoute(req)) return NextResponse.next()

  try {
    const agente = await prisma.agenteInmobiliario.findUnique({
      where: { clerkUserId: userId },
      select: { estado: true },
    })

    // Sin perfil → onboarding
    if (!agente) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

  if (!agente ) {
  if (!isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }
    return NextResponse.next()
  }
    if (agente.estado === 'RECHAZADO') {
      if (!isCuentaRechazadaRoute(req)) {
        return NextResponse.redirect(new URL('/cuenta-rechazada', req.url))
      }
      return NextResponse.next()
    }

    if (agente.estado === 'PENDIENTE') {
      if (!isCuentaRevisionRoute(req)) {
        return NextResponse.redirect(new URL('/cuenta-en-revision', req.url))
      }
      return NextResponse.next()
    }

    if (agente.estado === 'ACEPTADO') {
      if (!isDashboardRoute(req)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.next()
    }
  } catch (error) {
    console.error(error)
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}