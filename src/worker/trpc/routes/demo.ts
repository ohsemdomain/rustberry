// src/worker/trpc/routes/demo.ts
import { publicProcedure, router } from '../trpc-instance'

export const demoRouter = router({
	hello: publicProcedure.query(() => {
		return {
			name: 'Cloudflare (with tRPC)',
		}
	}),
})
