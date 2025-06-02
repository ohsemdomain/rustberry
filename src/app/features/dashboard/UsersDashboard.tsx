import { useAuth } from '@/app/AuthProvider'
import { QuoteComponent } from '@/app/components/zen-quotes/QuoteComponent'

export function UsersDashboard() {
	const { user } = useAuth()

	return (
		<div>
			<div>
				<h1>Users Dashboard</h1>
				<p>Welcome, {user?.name}!</p>
				<p>Role: {user?.role}</p>
			</div>
			<QuoteComponent />
		</div>
	)
}
