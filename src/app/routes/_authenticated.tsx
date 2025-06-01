import { useAuth } from '@/AuthProvider'
import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
	component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
	const { user, isLoading } = useAuth()

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!user) {
		return <Navigate to="/login" />
	}

	return <Outlet />
}
