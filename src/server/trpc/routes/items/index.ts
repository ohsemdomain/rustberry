import { router } from '@/server/trpc/trpc-instance'
import { coreRouter } from './core'

export const itemsRouter = router({
	// Core item CRUD operations
	create: coreRouter.create,
	listAll: coreRouter.listAll,
	getById: coreRouter.getById,
	update: coreRouter.update,
})
