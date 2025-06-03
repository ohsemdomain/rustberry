import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

export function CustomersList() {
	const { hasPermission } = useAuth()
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<0 | 1 | undefined>(1) // Default to active
	const [page, setPage] = useState(1)

	const { data, isLoading, error, isFetching } = trpc.customers.list.useQuery({
		page,
		search: search || undefined,
		status,
	})

	if (isLoading) return <div>Loading customers...</div>
	if (error) return <div>Error: {error.message}</div>
	if (!data) return <div>No data available</div>

	return (
		<div style={{ padding: '1rem', position: 'relative' }}>
			<LoadingOverlay isLoading={isFetching} message="Loading customers..." />
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '1rem',
				}}
			>
				<h1>Customers</h1>
				{hasPermission('customers', 'create') && (
					<Link
						to="/customers/create"
						style={{
							backgroundColor: '#007bff',
							color: 'white',
							padding: '0.5rem 1rem',
							textDecoration: 'none',
							borderRadius: '4px',
						}}
					>
						Create Customer
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
					placeholder="Search customers..."
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

			{/* Customers Table */}
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
							Email
						</th>
						<th
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								textAlign: 'left',
							}}
						>
							Status
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
					{data.customers.length === 0 ? (
						<tr>
							<td
								colSpan={5}
								style={{
									padding: '1rem',
									textAlign: 'center',
									border: '1px solid #ddd',
								}}
							>
								No customers found
							</td>
						</tr>
					) : (
						data.customers.map((customer) => (
							<tr key={customer.id}>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{customer.id}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{customer.customer_name}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{customer.customer_email || '-'}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									<span
										style={{
											color: customer.status === 1 ? 'green' : 'red',
											fontWeight: 'bold',
										}}
									>
										{customer.status === 1 ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									<Link
										to="/customers/$customerId"
										params={{ customerId: customer.id }}
										style={{
											marginRight: '0.5rem',
											color: '#007bff',
											textDecoration: 'none',
										}}
									>
										Show
									</Link>
									{hasPermission('customers', 'update-any') && (
										<Link
											to="/customers/$customerId/edit"
											params={{ customerId: customer.id }}
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
