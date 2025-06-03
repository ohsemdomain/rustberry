import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export function CustomersList() {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()

	const [search, setSearch] = useState('')
	const [status] = useState<0 | 1 | undefined>(1)
	const [page] = useState(1)

	const { data, isLoading, error, isFetching } = trpc.customers.list.useQuery({
		page,
		search: search || undefined,
		status,
	})

	if (isLoading) return <div>Loading customers...</div>
	if (error) return <div>Error: {error.message}</div>
	if (!data) return <div>No data available</div>

	return (
		<div>
			<LoadingOverlay isLoading={isFetching} />
			<div className="content-header">
				<h1>Customers</h1>
				<div>
					{hasPermission('customers', 'create') && (
						<button
							className="button-blue"
							type="button"
							onClick={() => navigate({ to: '/customers/create' })}
						>
							Create Customer
						</button>
					)}
				</div>
			</div>

			<div className="content-body">
				<div className="content-actions">
					<input
						type="text"
						placeholder="Search customers..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<div className="display-flex">
						<span className="light-text">Total Items:</span>
						<select className="custom-select select-short">
							<option value={1}>Active</option>
							<option value={0}>Inactive</option>
							<option value="all">All</option>
						</select>
					</div>
				</div>

				<div className="scroll-container">
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Email</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{data.customers.length === 0 ? (
								<tr>
									<td>No customers found</td>
								</tr>
							) : (
								data.customers.map((customer) => (
									<tr key={customer.id}>
										<td>{customer.id}</td>
										<td>{customer.customer_name}</td>
										<td>{customer.customer_email || '-'}</td>
										<td>
											<span>
												{customer.status === 1 ? 'Active' : 'Inactive'}
											</span>
										</td>
										<td>
											<Link
												to="/customers/$customerId"
												params={{ customerId: customer.id }}
											>
												Show
											</Link>
											{hasPermission('customers', 'update-any') && (
												<Link
													to="/customers/$customerId/edit"
													params={{ customerId: customer.id }}
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
				</div>
			</div>
		</div>
	)
}
