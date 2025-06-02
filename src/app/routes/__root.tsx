import { useAuth } from '@/app/AuthProvider'
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	const { user, logout, canRead } = useAuth()

	return (
		<div>
			<div
				style={{
					position: 'fixed',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0.5rem',
					top: 0,
					left: 0,
					right: 0,
					zIndex: 1000,
					borderBottom: '1px solid #ddd',
					backgroundColor: 'white',
				}}
			>
				{user && (
					<div
						style={{
							maxWidth: '1280px',
							margin: '0 auto'
						}}
					>
						<nav
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								padding: '0.5rem',
								fontSize: '14px',
							}}
						>
							<div
								style={{
									display: 'flex',
									gap: '1rem',
								}}
							>
								{user && (
									<>
										<Link
											to="/"
											activeProps={{ style: { fontWeight: 'bold' } }}
										>
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

							<div className="light-text">
								{user ? (
									<>
										<span style={{ marginRight: '1rem' }}>{user.name}</span>
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
					</div>
				)}
			</div>

			<div style={{ padding: '1rem' }}>
				<Outlet />
			</div>
			<TanStackRouterDevtools />
		</div>
	)
}
