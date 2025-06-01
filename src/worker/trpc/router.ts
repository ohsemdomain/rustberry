import { authRouter } from '~/trpc/routes/auth'
import { demoRouter } from '~/trpc/routes/demo'
import { router } from '~/trpc/trpc-instance'

export const appRouter = router({
	demo: demoRouter,
	auth: authRouter,
})

export type AppRouter = typeof appRouter
