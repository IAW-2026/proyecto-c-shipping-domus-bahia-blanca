import SideBarClerk from "@/app/components/sideBarClerk"
import MosaicoSignIn from "@/app/components/mosaicoSignIn"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#f8f4ef] text-stone-900">
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
    </div>
  )
}