import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
/// <reference types="@cloudflare/workers-types" />
import { app } from './hono/api'
import { createContext } from './trpc/context'
import { appRouter } from './trpc/router'

export interface Env {
	DB: D1Database
	rustyberry_kv: KVNamespace
	rustyberry_r2: R2Bucket
	JWT_SECRET: string
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
} satisfies ExportedHandler<Env>
