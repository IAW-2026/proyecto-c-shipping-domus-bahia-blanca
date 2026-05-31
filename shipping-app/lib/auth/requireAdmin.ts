import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'

export type RoleMetadata = {
  roles?: unknown
  role?: unknown
  rol?: unknown
}

export function metadataHasAdminRole(metadata: RoleMetadata) {
  const values = [metadata.roles, metadata.role, metadata.rol]

  return values.some((value) => {
    if (Array.isArray(value)) {
      return value.includes('admin')
    }

    return value === 'admin'
  })
}

export async function userHasAdminRole(userId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)

  return metadataHasAdminRole(user.publicMetadata as RoleMetadata)
}

export async function requireAdmin() {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  if (!(await userHasAdminRole(userId))) {
    redirect('/unauthorized')
  }

  const client = await clerkClient()
  return client.users.getUser(userId)
}
