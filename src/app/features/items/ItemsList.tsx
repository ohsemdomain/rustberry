import { useAuth } from '@/app/AuthProvider'
import { trpc } from '@/app/trpc'
import { formatPrice } from '@/app/utils/price'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export function ItemsList() {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const [searchInput, setSearchInput] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [status, setStatus] = useState<0 | 1 | undefined>(1) // Default to active

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput)
		}, 300) // 300ms delay

		return () => clearTimeout(timer)
	}, [searchInput])

	const { data, isLoading, error } = trpc.items.list.useQuery({
		page: 1,
		search: debouncedSearch || undefined,
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
							className="button-blue"
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
						placeholder="Search items..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<div className="display-flex">
						<span className="light-text">Total Items: {data.totalItems}</span>
						<select
							className="custom-select select-short"
							value={status === undefined ? 'all' : status}
							onChange={(e) => {
								const value = e.target.value
								setStatus(
									value === 'all' ? undefined : (Number(value) as 0 | 1),
								)
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
				</div>
			</div>
		</div>
	)
}
