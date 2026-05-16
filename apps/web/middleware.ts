import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/accept-invite',
  '/check-in',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let intl handle locale prefix first
  const segments = pathname.split('/')
  const maybeLocale = segments[1]
  const isValidLocale = routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
  const pathWithoutLocale = isValidLocale ? '/' + segments.slice(2).join('/') : pathname

  const isPublic =
    PUBLIC_PATHS.some((p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/')) ||
    pathWithoutLocale === '/' ||
    pathWithoutLocale === ''

  const token = request.cookies.get('vision_token')?.value

  // Redirect authenticated users away from login
  if (isPublic && token && pathWithoutLocale === '/login') {
    const locale = isValidLocale ? maybeLocale : 'ar'
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  // Redirect unauthenticated users to login
  if (!isPublic && !token) {
    const locale = isValidLocale ? maybeLocale : 'ar'
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|icons|audio|.*\\..*).*)'],
}
