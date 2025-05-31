import { router } from './trpc-instance'
import { demoRouter } from './routes/demo'

export const appRouter = router({
	demo: demoRouter,
})

export type AppRouter = typeof appRouter
