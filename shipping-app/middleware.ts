import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next()

  const { userId, sessionClaims } = await auth()

  // No autenticado
  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  // Provisorio:
  // Autenticado pero no es agente inmobiliario
  //TO-DO: Redirigir de manera correcta a otra pagina o mostrar advertencia.
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (role !== 'agente') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}