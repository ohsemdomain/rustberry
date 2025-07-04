import { authRouter } from '@/server/trpc/routes/auth'
import { customersRouter } from '@/server/trpc/routes/customers'
import { demoRouter } from '@/server/trpc/routes/demo'
import { invoicesRouter } from '@/server/trpc/routes/invoices'
import { itemsRouter } from '@/server/trpc/routes/items'
import { router } from '@/server/trpc/trpc-instance'

export const appRouter = router({
	demo: demoRouter,
	auth: authRouter,
	items: itemsRouter,
	customers: customersRouter,
	invoices: invoicesRouter,
})

export type AppRouter = typeof appRouter
