import { useAuth } from '@/app/AuthProvider'

export function UsersDashboard() {
	const { user } = useAuth()

	return (
		<div>
			<h1>Users Dashboard</h1>
			<p>Welcome, {user?.name}!</p>
			<p>Role: {user?.role}</p>
		</div>
	)
}
