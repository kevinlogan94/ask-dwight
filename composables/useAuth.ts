import { ref } from 'vue'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  // Mock login function - in a real app, this would call your authentication API
  const login = () => {
    user.value = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://avatars.githubusercontent.com/u/739984?v=4'
    }
  }

  // Mock logout function
  const logout = () => {
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    login,
    logout
  }
}
