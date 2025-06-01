import { authRouter } from '~/trpc/routes/auth'
import { demoRouter } from '~/trpc/routes/demo'
import { itemsRouter } from '~/trpc/routes/items'
import { router } from '~/trpc/trpc-instance'

export const appRouter = router({
	demo: demoRouter,
	auth: authRouter,
	items: itemsRouter,
})

export type AppRouter = typeof appRouter
