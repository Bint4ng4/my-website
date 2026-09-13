import Image from "next/image"
import Link from "next/link"
import NavItems from "./navitems"
import { Show, SignInButton, UserButton } from "@clerk/nextjs"

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between mx-auto w-full px-14 py-4 bg-white max-sm:px-4 sticky top-0 z-50">
      <Link href="/">
        <div className="flex items-center gap-2.5 cursor-pointer">
            <Image 
                src="/images/logo.svg" 
                alt="logo" 
                width={46} 
                height={44}     
                className="w-auto h-auto"
            />
        </div>
      </Link>
        <div className="flex items-center gap-8">
            <NavItems />
            {/* <SignOutButton > */}
              <div className="flex items-center gap-2">
                <Show when="signed-out">
                  <SignInButton>
                    <button className="btn-signin">Sign In</button>
                  </SignInButton>
                </Show>
              </div>
             <Show when="signed-in">
              <UserButton />
            </Show>
            
            
        </div>
    </nav>
  )
}

export default Navbar
