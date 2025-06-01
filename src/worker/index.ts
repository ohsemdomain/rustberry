import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { app } from '~/hono/api'
import { createContext } from '~/trpc/context'
import { appRouter } from '~/trpc/router'
import type { Env } from '~/worker-env'

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
