import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { formatDateTime } from '@/app/utils/date'
import { formatPrice } from '@/app/utils/price'
import { Link, useNavigate } from '@tanstack/react-router'

interface ShowItemProps {
	itemId: string
}

export function ShowItem({ itemId }: ShowItemProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const { data: item, isLoading, error } = trpc.items.getById.useQuery(itemId)

	if (error) return <div>Error: {error.message}</div>
	if (!isLoading && !item) return <div>Item not found</div>

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
		<div className="component-wrapper">
			<div className="content-header">
				<h1>Item Details</h1>
				<div className="display-flex">
					<div className="display-flex">
						<Link to="/items">← Back</Link>
					</div>
					<div>
						{hasPermission('items', 'update-any') && item && (
							<button
								className="button-gray"
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
			</div>

			<div className="content-body">
				<div className="fetch-container">
					<LoadingOverlay isLoading={isLoading} message="Loading item..." />
					{item && (
						<div className="show-container-1">
							<div className="show-container-item-1">
								<div>
									<p>
										<strong>ID:</strong> {item.id}
									</p>
									<p>
										<strong>Name:</strong> {item.item_name}
									</p>
									<p>
										<strong>Category:</strong>{' '}
										{getCategoryName(item.item_category)}
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
										<strong>Created:</strong> {formatDateTime(item.created_at)}
									</p>
									<p>
										<strong>Created by:</strong> {item.created_by}
									</p>
									<p>
										<strong>Updated:</strong> {formatDateTime(item.updated_at)}
									</p>
									<p>
										<strong>Updated by:</strong> {item.updated_by}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
