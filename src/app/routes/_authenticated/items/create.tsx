import { CreateItem } from '@/features/items/CreateItem'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/items/create')({
	component: CreateItemPage,
})

function CreateItemPage() {
	return <CreateItem />
}
