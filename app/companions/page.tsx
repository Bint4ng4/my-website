import CompanionCard from "@/components/companioncard";
import CompanionForm from "@/components/companionform"
import SearchInput from "@/components/searchinput";
import SubjectFilters from "@/components/subjectfilters";
import { getAllCompanions } from "@/lib/action/companion.actions";
import { getSubjectColor } from "@/lib/utils";

const CompaniosLibrary = async ({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) => {
  const filters = await searchParams;
  console.log('PARAMS:', filters); 
  const subject = filters.subject ? filters.subject : '';
  const topic = filters.topic ? filters.topic : '';

  const companions = await getAllCompanions({ subject, topic });
  console.log(companions);
  return (
    <main >
      <section className="flex justify-between gap-4 max-sm:flex-col">
       <h1>Companions Library</h1>
       <div className="flex gap-4">
         <SearchInput />
         <SubjectFilters />
       </div>
       </section>
       <section className="flex justify-between gap-4 max-sm:flex-col">
        {companions.map((companion) => (
          <div key={companion.id}>
            <CompanionCard 
                  key={companion.id} 
                  {...companion} 
                  color={getSubjectColor(companion.subject)}
            
            />
          </div>
        ))}
       </section>
    </main>
  );
}

export default CompaniosLibrary
