import type {
  ApiResponseLoginData,
  LoginRequest,
  RegisterUserRequest,
} from '@/api/generated/bulbAPI.schemas'

export type User = ApiResponseLoginData

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: ( data: LoginRequest ) => Promise<{ success: boolean; error?: string }>
  register: ( data: RegisterUserRequest ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}
