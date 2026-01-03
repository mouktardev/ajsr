import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_home/certificate/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <section className='container mx-auto flex flex-1 flex-col gap-5 p-3 md:p-5'>
      
    </section>
  )
}
