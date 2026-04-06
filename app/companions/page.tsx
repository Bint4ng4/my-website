import CompanionForm from "@/components/companionform"

const CompaniosLibrary = () => {
  return (
    <main className="min-lg:w-2/4 min-md:w2/3 items-center justify-center">
      <article className="w-full gap-4 flex flex-col">
        <h1>Companions Builder</h1>
        <CompanionForm />
      </article>
    </main>
  )
}

export default CompaniosLibrary
