import { app } from '@/server/hono/api'
import { createContext } from '@/server/trpc/context'
import { appRouter } from '@/server/trpc/router'
import type { Env } from '@/server/worker-env'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

interface ZenQuoteResponse {
	q: string
	a: string
}

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
	async scheduled(
		_controller: ScheduledController,
		env: Env,
		_ctx: ExecutionContext,
	): Promise<void> {
		// Fetch today's quote from zenquotes.io
		try {
			const response = await fetch('https://zenquotes.io/api/today')
			const data = (await response.json()) as ZenQuoteResponse[]

			if (data?.[0]) {
				const quote = {
					quote: data[0].q,
					author: data[0].a,
				}

				// Store in KV
				await env.rustyberry_kv.put(
					'daily_quote_current',
					JSON.stringify(quote),
				)
			}
		} catch (error) {
			console.error('Failed to fetch daily quote:', error)
		}
	},
} satisfies ExportedHandler<Env>
