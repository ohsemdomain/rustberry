import { useAuth } from '@/AuthProvider'
import { trpc } from '@/trpc'
import { formatPrice } from '@/utils/price'
import { Link, useNavigate } from '@tanstack/react-router'

interface ShowItemProps {
	itemId: string
}

export function ShowItem({ itemId }: ShowItemProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const { data: item, isLoading, error } = trpc.items.getById.useQuery(itemId)

	if (isLoading) return <div style={{ padding: '1rem' }}>Loading...</div>
	if (error)
		return <div style={{ padding: '1rem' }}>Error: {error.message}</div>
	if (!item) return <div style={{ padding: '1rem' }}>Item not found</div>

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

	const getStatusColor = (status: number) => {
		return status === 1 ? 'green' : 'red'
	}

	return (
		<div style={{ padding: '1rem', maxWidth: '600px' }}>
			{/* Header */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '2rem',
					borderBottom: '1px solid #ddd',
					paddingBottom: '1rem',
				}}
			>
				<h1>Item Details</h1>
				<div style={{ display: 'flex', gap: '1rem' }}>
					{hasPermission('items', 'update-any') && (
						<Link
							to="/items/$itemId/edit"
							params={{ itemId: item.id }}
							style={{
								backgroundColor: '#007bff',
								color: 'white',
								padding: '0.5rem 1rem',
								textDecoration: 'none',
								borderRadius: '4px',
							}}
						>
							Edit Item
						</Link>
					)}
					<button
						type="button"
						onClick={() => navigate({ to: '/items' })}
						style={{
							backgroundColor: '#6c757d',
							color: 'white',
							padding: '0.5rem 1rem',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Back to Items
					</button>
				</div>
			</div>

			{/* Item Details */}
			<div style={{ display: 'grid', gap: '1.5rem' }}>
				{/* ID */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Item ID
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
							fontFamily: 'monospace',
						}}
					>
						{item.id}
					</div>
				</div>

				{/* Name */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Item Name
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
						}}
					>
						{item.item_name}
					</div>
				</div>

				{/* Category */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Category
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
						}}
					>
						{getCategoryName(item.item_category)}
					</div>
				</div>

				{/* Price */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Price
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
							fontSize: '1.1rem',
							fontWeight: 'bold',
						}}
					>
						{formatPrice(item.item_price_cents)}
					</div>
				</div>

				{/* Description */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Description
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
							minHeight: '4rem',
							whiteSpace: 'pre-wrap',
						}}
					>
						{item.item_description || 'No description provided'}
					</div>
				</div>

				{/* Status */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Status
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
						}}
					>
						<span
							style={{
								color: getStatusColor(item.item_status),
								fontWeight: 'bold',
							}}
						>
							{getStatusName(item.item_status)}
						</span>
					</div>
				</div>

				{/* Metadata */}
				<div
					style={{
						borderTop: '1px solid #ddd',
						paddingTop: '1rem',
						marginTop: '1rem',
					}}
				>
					<h3 style={{ marginBottom: '1rem', color: '#666' }}>
						Item Information
					</h3>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '1rem',
						}}
					>
						<div>
							<div
								style={{
									display: 'block',
									fontWeight: 'bold',
									marginBottom: '0.25rem',
									color: '#666',
									fontSize: '0.9rem',
								}}
							>
								Created At
							</div>
							<div style={{ fontSize: '0.9rem', color: '#666' }}>
								{new Date(item.created_at).toLocaleString()}
							</div>
						</div>
						<div>
							<div
								style={{
									display: 'block',
									fontWeight: 'bold',
									marginBottom: '0.25rem',
									color: '#666',
									fontSize: '0.9rem',
								}}
							>
								Last Updated
							</div>
							<div style={{ fontSize: '0.9rem', color: '#666' }}>
								{new Date(item.updated_at).toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
