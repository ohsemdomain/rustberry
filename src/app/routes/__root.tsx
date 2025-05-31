import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
	component: () => (
		<>
			<div>
				<nav>
					<Link to="/" activeProps={{ style: { fontWeight: 'bold' } }}>
						Home
					</Link>{' '}
					<Link to="/about" activeProps={{ style: { fontWeight: 'bold' } }}>
						About
					</Link>{' '}
					<Link to="/contact" activeProps={{ style: { fontWeight: 'bold' } }}>
						Contact
					</Link>
					<Link to="/trpc-demo" activeProps={{ style: { fontWeight: 'bold' } }}>
						tRPC Demo
					</Link>
					<Link to="/hono-demo" activeProps={{ style: { fontWeight: 'bold' } }}>
						Hono Demo
					</Link>
				</nav>
				<hr />
			</div>
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
})
