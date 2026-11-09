import { useQueryClient } from '@tanstack/react-query'
import {
  useMe,
  getMeQueryKey,
  useLogin,
  useLogout,
  useRegisterUser,
} from '@/api/generated/auth/auth'
import type { LoginRequest, RegisterUserRequest } from '@/api/generated/bulbAPI.schemas'
import { AuthContext } from './auth-context'

export function AuthProvider( { children }: { children: React.ReactNode } ) {
  const queryClient = useQueryClient()
  const { data: meData, isPending, refetch } = useMe( {
    query : {
      retry                : false,
      refetchOnWindowFocus : false,
    },
  } )

  const loginMutation = useLogin()
  const registerMutation = useRegisterUser()
  const logoutMutation = useLogout()

  const user = meData && meData.status === 200 ? meData.data.data : null

  const refreshUser = async () => {
    await refetch()
  }

  const login = async ( data: LoginRequest ) => {
    try {
      const response = await loginMutation.mutateAsync( { data } )
      if ( response.status === 200 && response.data?.data ) {
        await queryClient.invalidateQueries( { queryKey : getMeQueryKey() } )
        await refetch()

        return { success : true }
      }

      return {
        success : false,
        error   : 'Invalid username or password.',
      }
    } catch {
      return {
        success : false,
        error   : 'An error occurred during login. Please try again.',
      }
    }
  }

  const register = async ( data: RegisterUserRequest ) => {
    try {
      const response = await registerMutation.mutateAsync( { data } )
      if ( response.status === 201 && response.data?.data ) {
        await queryClient.invalidateQueries( { queryKey : getMeQueryKey() } )
        await refetch()

        return { success : true }
      }

      return {
        success : false,
        error   : 'Registration failed. The username may already be in use.',
      }
    } catch {
      return {
        success : false,
        error   : 'An error occurred during registration. Please try again.',
      }
    }
  }

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      queryClient.clear()
      await refetch()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated : Boolean( user ),
        isLoading       : isPending,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
