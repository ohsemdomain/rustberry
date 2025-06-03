import { useAuth } from '@/app/AuthProvider'
import { trpc } from '@/app/trpc'
import { formatPrice } from '@/app/utils/price'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export function ItemsList() {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<0 | 1 | undefined>(1) // Default to active
	const [page, setPage] = useState(1)

	const { data, isLoading, error } = trpc.items.list.useQuery({
		page,
		search: search || undefined,
		status,
	})

	if (isLoading) return <div>Loading items...</div>
	if (error) return <div>Error: {error.message}</div>
	if (!data) return <div>No data available</div>

	return (
		<div className="component-wrapper">
			<div className="content-header">
				<h1>Items</h1>
				<div>
					{hasPermission('items', 'create') && (
						<button
							type="button"
							onClick={() => navigate({ to: '/items/create' })}
						>
							Create Item
						</button>
					)}
				</div>
			</div>

			<div className="content-body">
				{/* Filters */}
				<div className="content-actions">
					<input
						className="search-input"
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<div className="display-flex">
						<select
							className="custom-select"
							value={status === undefined ? 'all' : status}
							onChange={(e) => {
								const value = e.target.value
								setStatus(
									value === 'all' ? undefined : (Number(value) as 0 | 1),
								)
								setPage(1) // Reset to first page
							}}
						>
							<option value={1}>Active</option>
							<option value={0}>Inactive</option>
							<option value="all">All</option>
						</select>
					</div>
				</div>

				{/* Scrollable list container */}
				<div className="list-scroll-container">
					{/* Items List */}
					<div className="list-container">
						{data.items.length === 0 ? (
							<div className="list-empty">No items found</div>
						) : (
							data.items.map((item) => (
								<div key={item.id} className="list-item">
									{/* Left side - Item info */}
									<div className="list-item-content">
										<div className="list-item-info">
											<div className="list-item-title">{item.item_name}</div>
											<div className="list-item-meta">
												{item.id} •{' '}
												{item.item_category === 1
													? 'Packaging'
													: item.item_category === 2
														? 'Label'
														: 'Other'}{' '}
												• {formatPrice(item.item_price_cents)}
											</div>
										</div>
									</div>

									{/* Right side - Actions only */}
									<div className="list-item-links">
										<Link to="/items/$itemId" params={{ itemId: item.id }}>
											Show
										</Link>
										{hasPermission('items', 'update-any') && (
											<>
												<span className="list-item-separator">|</span>
												<Link
													to="/items/$itemId/edit"
													params={{ itemId: item.id }}
												>
													Edit
												</Link>
											</>
										)}
									</div>
								</div>
							))
						)}
					</div>

					{/* Pagination */}
					{data.totalPages > 1 && (
						<div
							style={{
								marginTop: '1rem',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								gap: '0.5rem',
							}}
						>
							<button
								type="button"
								onClick={() => setPage(page - 1)}
								disabled={!data.hasPrev}
								style={{
									padding: '0.5rem 1rem',
									border: '1px solid #ccc',
									backgroundColor: data.hasPrev ? 'white' : '#f5f5f5',
									cursor: data.hasPrev ? 'pointer' : 'not-allowed',
								}}
							>
								Previous
							</button>

							<span>
								Page {data.currentPage} of {data.totalPages}
							</span>

							<button
								type="button"
								onClick={() => setPage(page + 1)}
								disabled={!data.hasNext}
								style={{
									padding: '0.5rem 1rem',
									border: '1px solid #ccc',
									backgroundColor: data.hasNext ? 'white' : '#f5f5f5',
									cursor: data.hasNext ? 'pointer' : 'not-allowed',
								}}
							>
								Next
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
