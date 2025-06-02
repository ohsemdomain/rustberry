import { useAuth } from '@/app/AuthProvider'
import { trpc } from '@/app/trpc'
import { formatPrice } from '@/app/utils/price'
import { Link, useNavigate } from '@tanstack/react-router'

interface ShowItemProps {
	itemId: string
}

export function ShowItem({ itemId }: ShowItemProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const { data: item, isLoading, error } = trpc.items.getById.useQuery(itemId)

	if (isLoading) return <div>Loading...</div>
	if (error) return <div>Error: {error.message}</div>
	if (!item) return <div>Item not found</div>

	const getCategoryName = (category: number) => {
		switch (category) {
			case 1:
				return 'Packaging'
			case 2:
				return 'Label'
			case 3:
				return 'Other'
			default:
				return 'Unknown'
		}
	}

	const getStatusName = (status: number) => {
		return status === 1 ? 'Active' : 'Inactive'
	}

	return (
		<div>
			<div className="component-header">
				<div className="display-flex">
					<Link to="/items">← Back</Link>
					<h3>Item Details</h3>
				</div>
				<div>
					{hasPermission('items', 'update-any') && (
						<button
							type="button"
							onClick={() =>
								navigate({
									to: '/items/$itemId/edit',
									params: { itemId: item.id },
								})
							}
						>
							Edit Item
						</button>
					)}
				</div>
			</div>

			<div className="display-flex-top">
				<div>
					<p>
						<strong>ID:</strong> {item.id}
					</p>
					<p>
						<strong>Name:</strong> {item.item_name}
					</p>
					<p>
						<strong>Category:</strong> {getCategoryName(item.item_category)}
					</p>
					<p>
						<strong>Price:</strong> {formatPrice(item.item_price_cents)}
					</p>
					<p>
						<strong>Description:</strong>{' '}
						{item.item_description || 'No description provided'}
					</p>
					<p>
						<strong>Status:</strong> {getStatusName(item.item_status)}
					</p>
				</div>
				<div className="light-text">
					<p>
						<strong>Created:</strong>{' '}
						{new Date(item.created_at).toLocaleString()}
					</p>
					<p>
						<strong>Updated:</strong>{' '}
						{new Date(item.updated_at).toLocaleString()}
					</p>
				</div>
			</div>
		</div>
	)
}
