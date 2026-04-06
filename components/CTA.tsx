import Image from "next/image"
import Link from "next/link"

const Cta = () => {
  return (
    <section className="cta-section">
      <div className="cta-badge">
        Start learning your way 
        </div>
        <h2 className="text-3xl font-bold">
            Build and Personalize Your Companion
        </h2>
        <p className="cta-description">
          Pick a name, subject, voice, & personality — and start learning 
          through voice conversations that feel natural and fun.
        </p>
            <Image 
            src="/images/cta.svg" 
            alt="cta" 
            width={362} 
            height={232} 
            className="w-auto h-auto"
            />
        <button className="btn-primary">
            <Image 
            src="/icons/plus.svg" 
            alt="plus" 
            width={12} 
            height={12} 
            className="w-auto h-auto"
            />
            <Link href="/companions/new">
                <p >
                    Build a New Companion
                </p>
            </Link>
        </button>
     
    </section>
  )
}

export default Cta
