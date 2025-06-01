import { ItemForm } from '@/app/features/items/ItemForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/items/create')({
	component: CreateItemPage,
})

function CreateItemPage() {
	return <ItemForm />
}
