import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogInIcon } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { GuestRoute } from '@/components/Auth/AuthGuard'
import Button from '@/components/Buttons/Button'

export const Route = createFileRoute( '/login' )( {
  component : LoginPage,
} )

const schema = z.object( {
  username : z.string().min( 1, { message : 'Username is required' } ),
  password : z.string().min( 1, { message : 'Password is required' } ),
} )

type FormValues = z.infer<typeof schema>

const inputClassName =
  'transition-all duration-200 ease-in-out h-10 p-2 rounded-lg border border-navy/25 outline-none focus:ring-2 focus:outline-0 focus:ring-blue-400 placeholder:text-navy-overlay text-navy text-sm w-full'
const labelClassName = 'text-sm font-medium text-navy'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [ submitError, setSubmitError ] = useState<string | null>( null )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>( {
    resolver : zodResolver( schema ),
  } )

  const onSubmit = async ( data: FormValues ) => {
    setSubmitError( null )
    const result = await login( data )
    if ( result.success ) {
      navigate( { to : '/' } )
    } else {
      setSubmitError( result.error || 'Failed to log in. Please check your credentials.' )
    }
  }

  return (
    <GuestRoute>
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-navy/10 bg-white p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="font-primary text-2xl text-navy">on-off</h1>
            <p className="text-xs text-navy-overlay">
              Welcome back! Enter your credentials to manage your bulb.
            </p>
          </div>

          <form
            onSubmit={handleSubmit( onSubmit )}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className={labelClassName}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Enter username"
                className={inputClassName}
                {...register( 'username' )}
              />
              {errors.username?.message ? (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className={labelClassName}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                className={inputClassName}
                {...register( 'password' )}
              />
              {errors.password?.message ? (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              ) : null}
            </div>

            {submitError ? (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 p-2 rounded-lg">
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="w-full justify-center mt-1"
            >
              <LogInIcon className="w-4 h-4" /> Log In
            </Button>
          </form>

          <p className="text-xs text-center text-navy-overlay">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-navy font-medium underline hover:text-navy-light"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </GuestRoute>
  )
}
