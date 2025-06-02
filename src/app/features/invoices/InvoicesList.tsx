import { useAuth } from '@/app/AuthProvider'
import { trpc } from '@/app/trpc'
import { formatPrice } from '@/app/utils/price'
import { InvoiceStatus } from '@/shared/invoice'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

export function InvoicesList() {
	const { hasPermission } = useAuth()
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<InvoiceStatus | undefined>(InvoiceStatus.UNPAID)
	const [page, setPage] = useState(1)

	const { data, isLoading, error } = trpc.invoices.list.useQuery({
		page,
		search: search || undefined,
		status,
	})

	if (isLoading) return <div>Loading invoices...</div>
	if (error) return <div>Error: {error.message}</div>
	if (!data) return <div>No data available</div>

	const getStatusName = (status: InvoiceStatus) => {
		switch (status) {
			case InvoiceStatus.UNPAID:
				return 'Unpaid'
			case InvoiceStatus.PARTIAL:
				return 'Partial'
			case InvoiceStatus.PAID:
				return 'Paid'
			case InvoiceStatus.CANCELLED:
				return 'Cancelled'
			default:
				return 'Unknown'
		}
	}

	const getStatusColor = (status: InvoiceStatus) => {
		switch (status) {
			case InvoiceStatus.UNPAID:
				return 'red'
			case InvoiceStatus.PARTIAL:
				return 'orange'
			case InvoiceStatus.PAID:
				return 'green'
			case InvoiceStatus.CANCELLED:
				return 'gray'
			default:
				return 'gray'
		}
	}

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
				<h1>Invoices</h1>
				{hasPermission('invoices', 'create') && (
					<Link
						to="/invoices/create"
						style={{
							backgroundColor: '#007bff',
							color: 'white',
							padding: '0.5rem 1rem',
							textDecoration: 'none',
							borderRadius: '4px',
						}}
					>
						Create Invoice
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
					placeholder="Search invoices..."
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
						setStatus(value === 'all' ? undefined : (Number(value) as InvoiceStatus))
						setPage(1) // Reset to first page
					}}
					style={{
						padding: '0.5rem',
						border: '1px solid #ccc',
						borderRadius: '4px',
					}}
				>
					<option value={InvoiceStatus.UNPAID}>Unpaid</option>
					<option value={InvoiceStatus.PARTIAL}>Partial</option>
					<option value={InvoiceStatus.PAID}>Paid</option>
					<option value={InvoiceStatus.CANCELLED}>Cancelled</option>
					<option value="all">All</option>
				</select>
			</div>

			{/* Invoices Table */}
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
							Invoice #
						</th>
						<th
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								textAlign: 'left',
							}}
						>
							Customer
						</th>
						<th
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								textAlign: 'left',
							}}
						>
							Date
						</th>
						<th
							style={{
								padding: '0.75rem',
								border: '1px solid #ddd',
								textAlign: 'left',
							}}
						>
							Total
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
					{data.invoices.length === 0 ? (
						<tr>
							<td
								colSpan={6}
								style={{
									padding: '1rem',
									textAlign: 'center',
									border: '1px solid #ddd',
								}}
							>
								No invoices found
							</td>
						</tr>
					) : (
						data.invoices.map((invoice) => (
							<tr key={invoice.id}>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{invoice.invoice_number}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{invoice.customer_name}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{new Date(invoice.invoice_date).toLocaleDateString()}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									{formatPrice(invoice.total_cents)}
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									<span
										style={{
											color: getStatusColor(invoice.status),
											fontWeight: 'bold',
										}}
									>
										{getStatusName(invoice.status)}
									</span>
								</td>
								<td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
									<Link
										to="/invoices/$invoiceId"
										params={{ invoiceId: invoice.id }}
										style={{
											marginRight: '0.5rem',
											color: '#007bff',
											textDecoration: 'none',
										}}
									>
										View
									</Link>
									{hasPermission('invoices', 'update-any') && (
										<Link
											to="/invoices/$invoiceId/edit"
											params={{ invoiceId: invoice.id }}
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