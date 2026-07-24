import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute( '/' )( {
  component : Index,
} )

function Index() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-primary text-2xl text-navy">on-off</h1>
      <p className="text-navy-overlay">
        Edit <code className="font-code text-navy-light">src/routes/index.tsx</code>{' '}
        to get started.
      </p>
    </main>
  )
}
