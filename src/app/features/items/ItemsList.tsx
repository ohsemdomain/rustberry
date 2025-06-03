//src/app/features/items/ItemsList.tsx
import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { formatPrice } from '@/app/utils/price'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

export function ItemsList() {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const [searchInput, setSearchInput] = useState('')
	const [status, setStatus] = useState<0 | 1 | undefined>(1) // Default to active
	const [displayedCount, setDisplayedCount] = useState(20) // How many items to show

	// Load ALL items for the current status filter
	const { data, isLoading, error } = trpc.items.listAll.useQuery({
		status,
	})

	// Client-side filtering using useMemo - instant search, no re-renders
	const filteredItems = useMemo(() => {
		if (!data?.items) return []

		if (!searchInput.trim()) {
			return data.items
		}

		const searchTerm = searchInput.toLowerCase().trim()
		return data.items.filter((item) =>
			item.item_name.toLowerCase().includes(searchTerm),
		)
	}, [data?.items, searchInput])

	// Items to display (with pagination)
	const displayedItems = useMemo(() => {
		return filteredItems.slice(0, displayedCount)
	}, [filteredItems, displayedCount])

	const handleLoadMore = () => {
		setDisplayedCount((prev) => prev + 20)
	}

	const hasMoreToLoad = displayedCount < filteredItems.length

	// Show error without layout
	if (error) {
		return (
			<div className="component-wrapper">
				<div className="content-header">
					<h1>Items</h1>
				</div>
				<div className="content-body">
					<div style={{ padding: '2rem', textAlign: 'center' }}>
						Error: {error.message}
					</div>
				</div>
			</div>
		)
	}

	const totalItems = data?.totalItems || 0
	const filteredCount = filteredItems.length

	return (
		<div>
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
						<span className="light-text">
							{searchInput
								? `${filteredCount} of ${totalItems} items`
								: `Total Items: ${totalItems}`}
						</span>
						<select
							className="custom-select select-short"
							value={status === undefined ? 'all' : status}
							onChange={(e) => {
								const value = e.target.value
								setStatus(
									value === 'all' ? undefined : (Number(value) as 0 | 1),
								)
								setDisplayedCount(20) // Reset display count when filter changes
							}}
						>
							<option value={1}>Active</option>
							<option value={0}>Inactive</option>
							<option value="all">All</option>
						</select>
					</div>
				</div>

				<div className="scroll-container">
					{isLoading && <LoadingOverlay isLoading={true} />}
					{displayedItems.length === 0 && !isLoading ? (
						<div className="list-empty">
							{searchInput ? 'No items match your search' : 'No items found'}
						</div>
					) : (
						displayedItems.map((item) => (
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

					{/* Load More button */}
					{hasMoreToLoad && (
						<div className="list-item">
							<div className="list-item-content">
								<div
									className="list-item-info"
									style={{ textAlign: 'center', width: '100%' }}
								>
									<button
										type="button"
										onClick={handleLoadMore}
										className="button-blue"
										style={{ margin: '0 auto' }}
									>
										Load More ({displayedCount} of {filteredCount} shown)
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
