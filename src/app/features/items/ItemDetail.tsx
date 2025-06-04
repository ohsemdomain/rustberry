import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { formatDateTime } from '@/app/utils/date'
import { formatPrice } from '@/app/utils/price'
import { Link, useNavigate } from '@tanstack/react-router'

interface ItemDetailProps {
	itemId: string
}

export function ItemDetail({ itemId }: ItemDetailProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const { data: item, isLoading, error } = trpc.items.getById.useQuery(itemId)

	if (error) return <div className="list-empty">Error: {error.message}</div>
	if (!isLoading && !item)
		return <div className="list-empty">Item not found</div>

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

	const getStatusBadge = (status: number) => {
		return status === 1 ? (
			<span className="badge-success">Active</span>
		) : (
			<span className="badge-inactive">Inactive</span>
		)
	}

	return (
		<div>
			<div className="content-header">
				<h1>Item Details</h1>
				<div className="button-group">
					<Link to="/items">← Back</Link>
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

			<div className="content-body">
				<div className="scroll-container">
					<LoadingOverlay isLoading={isLoading} />
					{item && (
						<div className="detail-content">
							<div className="info-section">
								<h2>Item Information</h2>
								<div className="info-grid">
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
									</div>
									<div>
										<p>
											<strong>Price:</strong>{' '}
											{formatPrice(item.item_price_cents)}
										</p>
										<p>
											<strong>Status:</strong>{' '}
											{getStatusBadge(item.item_status)}
										</p>
									</div>
								</div>
							</div>

							{item.item_description && (
								<div className="info-section">
									<h2>Description</h2>
									<div className="card">
										<p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
											{item.item_description}
										</p>
									</div>
								</div>
							)}

							<div className="info-section light-text">
								<p>
									<strong>Created:</strong> {formatDateTime(item.created_at)} by{' '}
									{item.created_by}
								</p>
								<p>
									<strong>Last Updated:</strong>{' '}
									{formatDateTime(item.updated_at)} by {item.updated_by}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
