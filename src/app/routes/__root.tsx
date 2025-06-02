import { useAuth } from '@/app/AuthProvider'
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	const { user, logout, canRead } = useAuth()

	return (
		<>
			{user && (
				<div>
					<nav
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '0.5rem',
					}}
				>
					<div
						style={{
							display: 'flex',
							paddingRight: '1rem',
							gap: '1rem',
						}}
					>
						{user && (
							<>
								<Link to="/" activeProps={{ style: { fontWeight: 'bold' } }}>
									Dashboard
								</Link>{' '}
								<Link
									to="/about"
									activeProps={{ style: { fontWeight: 'bold' } }}
								>
									About
								</Link>{' '}
								<Link
									to="/contact"
									activeProps={{ style: { fontWeight: 'bold' } }}
								>
									Contact
								</Link>{' '}
							</>
						)}

						{user && canRead('items') && (
							<>
								{' '}
								<Link
									to="/items"
									activeProps={{ style: { fontWeight: 'bold' } }}
								>
									Items
								</Link>
							</>
						)}
						{user && canRead('customers') && (
							<>
								{' '}
								<Link
									to="/customers"
									activeProps={{ style: { fontWeight: 'bold' } }}
								>
									Customers
								</Link>
							</>
						)}
						{user && canRead('invoices') && (
							<>
								{' '}
								<Link
									to="/invoices"
									activeProps={{ style: { fontWeight: 'bold' } }}
								>
									Invoices
								</Link>
							</>
						)}
					</div>

					<div>
						{user ? (
							<>
								<span style={{ marginRight: '1rem' }}>
									{user.name} ({user.role})
								</span>
								<button
									type="button"
									onClick={logout}
									style={{ cursor: 'pointer' }}
								>
									Logout
								</button>
							</>
						) : (
							<Link to="/login">Login</Link>
						)}
					</div>
				</nav>
				<hr />
			</div>
		)}
		<Outlet />
			<TanStackRouterDevtools />
		</>
	)
}
