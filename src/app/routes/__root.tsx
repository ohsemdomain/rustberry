//src/app/routes/__root.tsx
import { useAuth } from '@/app/AuthProvider'
import type { ResourceType } from '@/shared/types'
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
	component: RootComponent,
})

// NavLink component
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
	return (
		<Link to={to} activeProps={{ style: { fontWeight: 'bold' } }}>
			{children}
		</Link>
	)
}

function RootComponent() {
	const { user, logout, canRead } = useAuth()

	// Navigation items
	const navItems: Array<{
		to: string
		label: string
		permission?: ResourceType
	}> = [
		{ to: '/', label: 'Dashboard' },
		{ to: '/about', label: 'About' },
		{ to: '/contact', label: 'Contact' },
		{ to: '/items', label: 'Items', permission: 'items' },
		{ to: '/customers', label: 'Customers', permission: 'customers' },
		{ to: '/invoices', label: 'Invoices', permission: 'invoices' },
	]

	return (
		<div>
			<div className="header">
				{user && (
					<div className="header-container">
						<nav className="nav">
							<div className="nav-links">
								{navItems
									.filter(
										(item) => !item.permission || canRead(item.permission),
									)
									.map((item, index) => (
										<span key={item.to}>
											{index > 0 && ' '}
											<NavLink to={item.to}>{item.label}</NavLink>
										</span>
									))}
							</div>

							<div className="light-text">
								<span className="user-info">{user.name}</span>
								<button className="button-gray" type="button" onClick={logout}>
									Logout
								</button>
							</div>
						</nav>
					</div>
				)}
			</div>

			<div className="content">
				<Outlet />
			</div>
			<TanStackRouterDevtools />
		</div>
	)
}
