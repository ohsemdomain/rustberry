import { app } from '@/server/hono/api'
import { createContext } from '@/server/trpc/context'
import { appRouter } from '@/server/trpc/router'
import type { Env } from '@/server/worker-env'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url)

		if (url.pathname.startsWith('/trpc')) {
			return fetchRequestHandler({
				endpoint: '/trpc',
				req: request,
				router: appRouter,
				createContext: (opts) => createContext({ ...opts, env }),
			})
		}

		return app.fetch(request, env, ctx)
	},
} satisfies ExportedHandler<Env>
