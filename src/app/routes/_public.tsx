import { useAuth } from '@/app/AuthProvider'
import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
	component: PublicLayout,
})

function PublicLayout() {
	const { user, isLoading } = useAuth()

	// If user is already logged in, redirect to dashboard
	if (!isLoading && user) {
		return <Navigate to="/" />
	}

	return <Outlet />
}
