import { useAuth } from '@/app/AuthProvider'
import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
	component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
	const { user, isLoading } = useAuth()

	if (isLoading) {
		return null // Silent auth check
	}

	if (!user) {
		return <Navigate to="/login" />
	}

	return <Outlet />
}
