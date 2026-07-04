'use client'

import { SignIn } from "@clerk/nextjs";

export default function SideBarClerk() {
  return (
    <section className="flex h-full items-center justify-center px-6 py-8 lg:px-14 lg:py-10">
      <div className="flex w-full max-w-[400px] flex-col items-center justify-center lg:max-w-md">
        <h1 data-unstyled-heading className="mb-8 w-full animate-[text-rise_700ms_ease-out_both] text-center font-display leading-[1.05] tracking-[-0.02em]">
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

        <div className="flex w-full justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                cardBox: "mx-auto w-full",
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}
