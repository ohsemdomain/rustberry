import { trpc } from '@/app/trpc'
import type { PermissionAction, ResourceType, User } from '@/shared/types'
import { rolePermissions } from '@/shared/types'
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react'

interface AuthContextType {
	user: User | null
	isLoading: boolean
	login: (token: string, user: User) => void
	logout: () => void
	refetch: () => void
	// Permission helpers
	hasPermission: (resource: ResourceType, action: PermissionAction) => boolean
	canRead: (resource: ResourceType) => boolean
	canCreate: (resource: ResourceType) => boolean
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

	// Permission helper functions
	const hasPermission = (
		resource: ResourceType,
		action: PermissionAction,
	): boolean => {
		if (!user) return false
		const userPermissions = rolePermissions[user.role]?.[resource] || []
		return userPermissions.includes(action)
	}

	const canRead = (resource: ResourceType): boolean => {
		return hasPermission(resource, 'read')
	}

	const canCreate = (resource: ResourceType): boolean => {
		return hasPermission(resource, 'create')
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				login,
				logout,
				refetch,
				hasPermission,
				canRead,
				canCreate,
			}}
		>
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
