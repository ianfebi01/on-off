import { Link } from "@tanstack/react-router"

const NotFound = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-primary text-2xl text-navy">404 - Page not found.</h1>
      <Link to="/"
        className="button"
      > Back to Home</Link>
    </main>
  )
}

export default NotFound