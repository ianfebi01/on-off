import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlusIcon } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { GuestRoute } from '@/components/Auth/AuthGuard'
import Button from '@/components/Buttons/Button'
import Card from '@/components/Cards/Card'
import Input from '@/components/Inputs/Input'

export const Route = createFileRoute( '/register' )( {
  component : RegisterPage,
} )

const schema = z
  .object( {
    username        : z.string().min( 3, { message : 'Username must be at least 3 characters' } ),
    password        : z.string().min( 6, { message : 'Password must be at least 6 characters' } ),
    confirmPassword : z.string().min( 1, { message : 'Please confirm your password' } ),
  } )
  .refine( ( data ) => data.password === data.confirmPassword, {
    message : 'Passwords do not match',
    path    : [ 'confirmPassword' ],
  } )

type FormValues = z.infer<typeof schema>

function RegisterPage() {
  const { register : registerUser } = useAuth()
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
    const result = await registerUser( {
      username : data.username,
      password : data.password,
    } )
    if ( result.success ) {
      navigate( { to : '/' } )
    } else {
      setSubmitError( result.error || 'Failed to create account.' )
    }
  }

  return (
    <GuestRoute>
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="font-primary text-2xl text-navy">on-off</h1>
            <p className="text-xs text-navy-overlay">
              Create an account to start managing your bulb and schedules.
            </p>
          </div>

          <form
            onSubmit={handleSubmit( onSubmit )}
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              id="username"
              label="Username"
              type="text"
              autoComplete="username"
              placeholder="Choose a username"
              error={errors.username?.message}
              {...register( 'username' )}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Choose a password (min 6 chars)"
              error={errors.password?.message}
              {...register( 'password' )}
            />

            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register( 'confirmPassword' )}
            />

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
              <UserPlusIcon className="w-4 h-4" /> Create Account
            </Button>
          </form>

          <p className="text-xs text-center text-navy-overlay">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-navy font-medium underline hover:text-navy-light"
            >
              Log in
            </Link>
          </p>
        </Card>
      </main>
    </GuestRoute>
  )
}
