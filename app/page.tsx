import CompanionCard from '@/components/companioncard'
import CompanionList from '@/components/companionlist'
import Cta from '@/components/CTA'
import { recentSessions } from '@/constants'

const Page = () => {
  return (
    <main>
      <h1>Popular Companions</h1>

      <section className="home-section">
          <CompanionCard 
            id="123"
            name="Neura the Brainy Explorer"
            topic="Neural Networks of the Brain"
            subject="science"
            duration={45}
            color="#E5D0FF"
          />
          <CompanionCard 
            id="456"
            name="Countsy the Number Wizard"
            topic="Derivatives & Integrals"
            subject="Math"
            duration={30}
            color="#FFDA6E"
          /><CompanionCard 
            id="789"
            name="Verba the Vocabulary Builder"
            topic="English Literature"
            subject="Language"
            duration={30}
            color="#BDE7FF"
          />
      </section>

      <section className="home-section">
          <CompanionList 
            title="Recenly completed session"
            companions={recentSessions}
            classname="w-2/3 max-lg:w-full"
          />
          <Cta />
      </section>

    </main>
  )
}

export default Page