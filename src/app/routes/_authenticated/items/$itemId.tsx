import { ShowItem } from '@/features/items/ShowItem'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/items/$itemId')({
	component: ShowItemPage,
})

function ShowItemPage() {
	const { itemId } = Route.useParams()
	return <ShowItem itemId={itemId} />
}