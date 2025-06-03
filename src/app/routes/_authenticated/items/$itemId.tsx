import { ItemDetail } from '@/app/features/items/ItemDetail'
import {
	Outlet,
	createFileRoute,
	useChildMatches,
} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/items/$itemId')({
	component: ShowItemPage,
})

function ShowItemPage() {
	const { itemId } = Route.useParams()
	const childMatches = useChildMatches()
	const hasChildRoute = childMatches.length > 0

	// If there's a child route (like edit), render only the Outlet
	// Otherwise, render the ItemDetail component
	if (hasChildRoute) {
		return <Outlet />
	}

	return <ItemDetail itemId={itemId} />
}
