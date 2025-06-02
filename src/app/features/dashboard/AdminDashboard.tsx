import { useAuth } from '@/app/AuthProvider'
import { Navigate } from '@tanstack/react-router'

export function AdminDashboard() {
	const { user, hasPermission } = useAuth()

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

	// Redirect to users dashboard if no wildcard permissions
	if (!hasWildcardPermissions) {
		return <Navigate to="/" />
	}

	return (
		<div>
			<h1>Admin Dashboard</h1>
			<p>Welcome, {user?.name}! You have administrator privileges.</p>
		</div>
	)
}
