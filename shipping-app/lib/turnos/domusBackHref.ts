const DEFAULT_DOMUS_BACK_URL = 'https://domus-buyer-app.vercel.app/'

function normalizeOrigin(value: string | undefined) {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function getBuyerBaseUrl() {
  return process.env.BUYER_APP_URL ?? DEFAULT_DOMUS_BACK_URL
}

function isAllowedDomusReturnUrl(value: string, requestOrigin: string | null) {
  try {
    const url = requestOrigin ? new URL(value, requestOrigin) : new URL(value)

    return url.href.startsWith(getBuyerBaseUrl())
  } catch {
    return false
  }
}

function isSchedulingInternalUrl(value: string, requestOrigin: string | null) {
  if (!requestOrigin) return false

  try {
    const url = new URL(value, requestOrigin)

    return (
      url.origin === requestOrigin &&
      (url.pathname.startsWith('/pedirturnos') ||
        url.pathname.startsWith('/turnos') ||
        url.pathname.startsWith('/sign-in'))
    )
  } catch {
    return false
  }
}

function isPropertyPageUrl(value: string, requestOrigin: string | null) {
  try {
    const url = requestOrigin ? new URL(value, requestOrigin) : new URL(value)

    return url.pathname.startsWith('/property/')
  } catch {
    return false
  }
}

export function requestOriginFromHeaders(headers: Headers) {
  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  const protocol = headers.get('x-forwarded-proto') ?? 'https'

  return normalizeOrigin(headers.get('origin') ?? (host ? `${protocol}://${host}` : undefined))
}

export function domusBackHref({
  returnTo,
  referer,
  requestOrigin,
  propertyId,
}: {
  returnTo?: string
  referer?: string | null
  requestOrigin: string | null
  propertyId?: string
}): { href: string; useBrowserBack: boolean } {
  if (returnTo && isAllowedDomusReturnUrl(returnTo, requestOrigin)) {
    const href = requestOrigin ? new URL(returnTo, requestOrigin).toString() : returnTo

    return {
      href,
      useBrowserBack: isPropertyPageUrl(href, requestOrigin),
    }
  }
  if (
    referer &&
    isAllowedDomusReturnUrl(referer, requestOrigin) &&
    !isSchedulingInternalUrl(referer, requestOrigin)
  ) {
    return {
      href: referer,
      useBrowserBack: isPropertyPageUrl(referer, requestOrigin),
    }
  }

  if (propertyId) {
    return {
      href: new URL(`/property/${propertyId}`, getBuyerBaseUrl()).toString(),
      useBrowserBack: false,
    }
  }

  return {
    href: getBuyerBaseUrl(),
    useBrowserBack: false,
  }
}
