import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAuth } from '../AuthProvider'

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	const { user, logout } = useAuth()

	return (
		<>
			<div>
				<nav
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '1rem',
					}}
				>
					<div>
						<Link to="/" activeProps={{ style: { fontWeight: 'bold' } }}>
							Home
						</Link>{' '}
						<Link to="/about" activeProps={{ style: { fontWeight: 'bold' } }}>
							About
						</Link>{' '}
						<Link to="/contact" activeProps={{ style: { fontWeight: 'bold' } }}>
							Contact
						</Link>{' '}
						<Link
							to="/trpc-demo"
							activeProps={{ style: { fontWeight: 'bold' } }}
						>
							tRPC Demo
						</Link>{' '}
						<Link
							to="/hono-demo"
							activeProps={{ style: { fontWeight: 'bold' } }}
						>
							Hono Demo
						</Link>
					</div>

					<div>
						{user ? (
							<>
								<span style={{ marginRight: '1rem' }}>
									{user.name} ({user.department})
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
			<Outlet />
			<TanStackRouterDevtools />
		</>
	)
}
