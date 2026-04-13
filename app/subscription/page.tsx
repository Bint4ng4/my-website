import { PricingTable } from '@clerk/nextjs'

const subscription = () => {
  return (
     <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      <PricingTable />
      <PricingTable />
    </div>
  )
}

export default subscription
