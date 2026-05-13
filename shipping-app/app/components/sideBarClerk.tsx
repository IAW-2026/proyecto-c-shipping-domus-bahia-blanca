import { SignIn } from "@clerk/nextjs";
import Image from "next/image"

export default function SideBarClerk() {
  return (
    <section className="flex h-full items-center justify-center px-6 py-8 lg:px-14 lg:py-10">
        <div className="absolute inset-0 lg:hidden">
                  <Image
  src="/casaMobile.webp"
  alt="Casa moderna en tonos cálidos"
  fill
  sizes="(max-width: 1024px) 100vw, 0vw"
  className="object-cover object-top blur-[1.5px]"
  priority
/>
                </div>
<div className="w-full max-w-md flex flex-col items-center">

  <div className="primary-text mb-8 animate-[text-rise_700ms_ease-out_both] text-center">

    {/* MOBILE */}
    <div className="lg:hidden flex flex-col leading-none">
      
      <span
        className="primary-text-domus-mobile ">
        DOMUS <span className="primary-text-bahia-mobile"> BB </span>
      </span>
    
      

    </div>

    {/* DESKTOP */}
    <div className="hidden lg:block">
      <span className="primary-text-domus">DOMUS</span>{" "}
      <span className="primary-text-bahia">BAHIA BLANCA</span>
    </div>

     <span className="secondary-text hidden lg:block">Scheduling app</span>

  </div>

  <SignIn />

</div>
    </section>
  );
}