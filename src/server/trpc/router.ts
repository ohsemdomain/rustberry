import { authRouter } from '@/server/trpc/routes/auth'
import { demoRouter } from '@/server/trpc/routes/demo'
import { itemsRouter } from '@/server/trpc/routes/items'
import { router } from '@/server/trpc/trpc-instance'

export const appRouter = router({
	demo: demoRouter,
	auth: authRouter,
	items: itemsRouter,
})

export type AppRouter = typeof appRouter
