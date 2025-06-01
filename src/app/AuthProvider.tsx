import { trpc } from '@/trpc'
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react'
import type { User } from '~/auth/types'

interface AuthContextType {
	user: User | null
	isLoading: boolean
	login: (token: string, user: User) => void
	logout: () => void
	refetch: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	const {
		data,
		refetch,
		isLoading: queryLoading,
	} = trpc.auth.me.useQuery(undefined, {
		retry: false,
	})

	useEffect(() => {
		if (!queryLoading) {
			setIsLoading(false)
			if (data) {
				setUser(data)
			} else {
				setUser(null)
			}
		}
	}, [data, queryLoading])

	const login = (token: string, user: User) => {
		localStorage.setItem('token', token)
		setUser(user)
		setIsLoading(false)
		// No need to refetch since we already have the user data
	}

	const logoutMutation = trpc.auth.logout.useMutation()

	const logout = () => {
		localStorage.removeItem('token')
		setUser(null)
		// Call logout mutation to handle any server-side cleanup
		logoutMutation.mutate()
	}

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout, refetch }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
