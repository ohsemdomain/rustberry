import { ShowItem } from '@/app/features/items/ShowItem'
import { createFileRoute, Outlet, useChildMatches } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/items/$itemId')({
	component: ShowItemPage,
})

function ShowItemPage() {
	const { itemId } = Route.useParams()
	const childMatches = useChildMatches()
	const hasChildRoute = childMatches.length > 0

	// If there's a child route (like edit), render only the Outlet
	// Otherwise, render the ShowItem component
	if (hasChildRoute) {
		return <Outlet />
	}

	return <ShowItem itemId={itemId} />
}
