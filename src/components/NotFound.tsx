import Button from "./Buttons/Button"

const NotFound = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-primary text-2xl text-navy font-medium">404 - <span className="font-normal">Page not found.</span></h1>
      <Button to="/"
        variant="link"
      > Back to Home</Button>
    </main>
  )
}

export default NotFound