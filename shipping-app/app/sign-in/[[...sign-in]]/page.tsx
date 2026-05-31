import SideBarClerk from "@/app/components/sign-in/sideBarClerk"
import MosaicoSignIn from "@/app/components/sign-in/mosaicoSignIn"
import Image from "next/image"

export const metadata = {
  title: 'Ingresar - Domus',
  description: 'Ingreso seguro a Domus para agentes inmobiliarios y usuarios autorizados.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function SignInPage() {
  
  return (
    <main className="min-h-screen bg-[#f8f4ef] text-stone-900">
      <div className="relative overflow-hidden bg-surface">
        <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,520px)]">
          <div className="hidden lg:block">
            <MosaicoSignIn>
              <Image
                src="/fondo.webp"
                alt="Casa moderna en tonos calidos"
                fill
                sizes="(min-width: 1024px) calc(100vw - 520px), 0px"
                className="absolute inset-0 object-cover"
                priority
                fetchPriority="high"
                quality={76}
              />
            </MosaicoSignIn>
          </div>
          <div className="relative z-10">
            <div className="absolute inset-0 lg:hidden">
              <Image
                src="/casaMobile.webp"
                alt="Casa moderna en tonos calidos"
                fill
                sizes="100vw"
                className="object-cover object-top blur-[1.5px]"
                priority
                fetchPriority="high"
                quality={76}
              />
            </div>
            <SideBarClerk />
          </div>
        </div>
      </div>
    </main>
  )
}
