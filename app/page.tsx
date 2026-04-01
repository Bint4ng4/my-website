import { Button } from '@/components/ui/button'
import React from 'react'

const Page = () => {
  return (
    <div>
      <h1 className='text-3xl underline'>Welcome to My App</h1>
      <button className='bg-blue-500 text-white px-4 py-2 rounded mt-4'>Click Me</button>
      <Button> button pakai shadcn</Button>
    </div>
  )
}

export default Page