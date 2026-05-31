'use client'

import { SignIn } from "@clerk/nextjs";

export default function SideBarClerk() {
  return (
    <section className="flex h-full items-center justify-center px-6 py-8 lg:px-14 lg:py-10">
      <div className="flex min-h-[680px] w-full max-w-md flex-col items-center justify-center sm:min-h-[720px] lg:min-h-0">
        <h1 className="mb-8 h-[70px] animate-[text-rise_700ms_ease-out_both] text-center font-display leading-[1.05] tracking-[-0.02em] lg:h-[86px]">
          {/* MOBILE */}
          <span className="lg:hidden flex flex-col leading-none">
            <span className="text-[50px] font-black text-[#141414]">
              DOMUS
            </span>
            <span className="text-[20px] font-black text-[#49634e]">Bahia Blanca</span>
          </span>

          {/* DESKTOP */}
          <span className="hidden lg:block">
            <span className="text-[30px] font-semibold text-[#2F2F2F]">DOMUS </span>{" "}
            <span className="text-[30px] font-semibold text-[#6B8F71]">BAHIA BLANCA</span>
          </span>
          <span className="hidden lg:block text-[20px] font-normal">Scheduling app</span>
        </h1>

        <div className="w-full min-h-[600px]">
          <SignIn
            appearance={{
              elements: {
                header: "hidden",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                cardBox: "min-h-[560px]",
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}
