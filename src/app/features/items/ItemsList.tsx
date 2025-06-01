import { useAuth } from '@/app/AuthProvider'
import { trpc } from '@/app/trpc'
import { formatPrice } from '@/app/utils/price'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

export function ItemsList() {
	const { hasPermission } = useAuth()
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
		<div style={{ padding: '1rem' }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '1rem',
				}}
			>
				<h1>Items</h1>
				{hasPermission('items', 'create') && (
					<Link
						to="/items/create"
						style={{
							backgroundColor: '#007bff',
							color: 'white',
							padding: '0.5rem 1rem',
							textDecoration: 'none',
							borderRadius: '4px',
						}}
					>
						Create Item
					</Link>
				)}
			</div>

			{/* Filters */}
			<div
				style={{
					marginBottom: '1rem',
					display: 'flex',
					gap: '1rem',
					alignItems: 'center',
				}}
			>
				<input
					type="text"
					placeholder="Search items..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					style={{
						padding: '0.5rem',
						border: '1px solid #ccc',
						borderRadius: '4px',
						minWidth: '200px',
					}}
				/>

				<select
					value={status === undefined ? 'all' : status}
					onChange={(e) => {
						const value = e.target.value
						setStatus(value === 'all' ? undefined : (Number(value) as 0 | 1))
						setPage(1) // Reset to first page
					}}
					style={{
						padding: '0.5rem',
						border: '1px solid #ccc',
						borderRadius: '4px',
					}}
				>
					<option value={1}>Active</option>
					<option value={0}>Inactive</option>
					<option value="all">All</option>
				</select>
			</div>

			{/* Items Table */}
			<table
				style={{
					width: '100%',
					borderCollapse: 'collapse',
					border: '1px solid #ddd',
				}}
			>
				<thead>
					<tr style={{ backgroundColor: '#f5f5f5' }}>
						<th
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								textAlign: 'left',
							}}
						>
							ID
						</th>
						<th
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								textAlign: 'left',
							}}
						>
							Name
						</th>
						<th
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								textAlign: 'left',
							}}
						>
							Category
						</th>
						<th
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								textAlign: 'left',
							}}
						>
							Price
						</th>
						<th
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								textAlign: 'left',
							}}
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{data.items.length === 0 ? (
						<tr>
							<td
								colSpan={5}
								style={{
									padding: '1rem',
									textAlign: 'center',
									border: '1px solid #ddd',
								}}
							>
								No items found
							</td>
						</tr>
					) : (
						data.items.map((item) => (
							<tr key={item.id}>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{item.id}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{item.item_name}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{item.item_category === 1
										? 'Packaging'
										: item.item_category === 2
											? 'Label'
											: 'Other'}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{formatPrice(item.item_price_cents)}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									<Link
										to="/items/$itemId"
										params={{ itemId: item.id }}
										style={{
											marginRight: '0.5rem',
											color: '#007bff',
											textDecoration: 'none',
										}}
									>
										Show
									</Link>
									{hasPermission('items', 'update-any') && (
										<Link
											to="/items/$itemId/edit"
											params={{ itemId: item.id }}
											style={{
												color: '#007bff',
												textDecoration: 'none',
											}}
										>
											Edit
										</Link>
									)}
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>

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
	)
}
