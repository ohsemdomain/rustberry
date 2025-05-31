import { authRouter } from './routes/auth'
import { demoRouter } from './routes/demo'
import { router } from './trpc-instance'

export const appRouter = router({
	demo: demoRouter,
	auth: authRouter,
})

export type AppRouter = typeof appRouter
