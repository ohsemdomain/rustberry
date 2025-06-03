import { router } from '@/server/trpc/trpc-instance'
import { coreRouter } from './core'
import { relationshipsRouter } from './relationships'

export const customersRouter = router({
	// Core customer CRUD operations
	create: coreRouter.create,
	createWithDetails: coreRouter.createWithDetails,
	list: coreRouter.list,
	listAll: coreRouter.listAll,
	searchByPhone: coreRouter.searchByPhone,
	getById: coreRouter.getById,
	update: coreRouter.update,
	delete: coreRouter.delete,

	// Contact and address management
	addContact: relationshipsRouter.addContact,
	updateContact: relationshipsRouter.updateContact,
	removeContact: relationshipsRouter.removeContact,
	addAddress: relationshipsRouter.addAddress,
	updateAddress: relationshipsRouter.updateAddress,
	removeAddress: relationshipsRouter.removeAddress,
})
