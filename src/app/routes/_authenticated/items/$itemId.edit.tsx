import { ItemForm } from '@/app/features/items/ItemForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/items/$itemId/edit')({
	component: EditItemPage,
})

function EditItemPage() {
	const { itemId } = Route.useParams()
	return <ItemForm itemId={itemId} />
}
