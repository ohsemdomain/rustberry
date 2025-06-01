import { ItemsList } from '@/features/items/ItemsList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/items/')({
	component: ItemsIndex,
})

function ItemsIndex() {
	return <ItemsList />
}