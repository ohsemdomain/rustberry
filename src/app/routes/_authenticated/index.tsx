import { useAuth } from '@/app/AuthProvider'
import { AdminDashboard } from '@/app/features/dashboard/AdminDashboard'
import { UsersDashboard } from '@/app/features/dashboard/UsersDashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { hasPermission } = useAuth()

	// Check if user has any wildcard (update-any or delete-any) permissions
	const hasWildcardPermissions =
		hasPermission('items', 'update-any') ||
		hasPermission('items', 'delete-any') ||
		hasPermission('customers', 'update-any') ||
		hasPermission('customers', 'delete-any') ||
		hasPermission('invoices', 'update-any') ||
		hasPermission('invoices', 'delete-any') ||
		hasPermission('note', 'update-any') ||
		hasPermission('note', 'delete-any') ||
		hasPermission('task', 'update-any') ||
		hasPermission('task', 'delete-any')

	// Render AdminDashboard for users with wildcard permissions, UsersDashboard for others
	return hasWildcardPermissions ? <AdminDashboard /> : <UsersDashboard />
}
