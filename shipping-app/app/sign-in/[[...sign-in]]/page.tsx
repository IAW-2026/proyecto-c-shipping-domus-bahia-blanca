import SideBarClerk from "@/app/components/sign-in/sideBarClerk"
import MosaicoSignIn from "@/app/components/sign-in/mosaicoSignIn"

export const metadata = {
  title: 'Ingresar - Domus',
}

export default function SignInPage() {
  
  return (
    <main className="min-h-screen bg-[#f8f4ef] text-stone-900">
      <div className="relative overflow-hidden bg-surface">
        <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,520px)]">
          <div className="hidden lg:block">
            <MosaicoSignIn />
          </div>
          <div className="relative z-10">
            <SideBarClerk />
          </div>
        </div>
      </div>
    </main>
  )
}
