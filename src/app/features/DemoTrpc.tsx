// src/app/DemoTrpcPage.tsx
import { useState } from 'react'
import reactLogo from '@/assets/react.svg'
import { trpc } from '@/trpc'
import '@/styles.css'

function DemoTrpcPage() {
	const [name, setName] = useState('unknown')
	const [shouldFetch, setShouldFetch] = useState(false)

	// Use tRPC query
	const { data } = trpc.demo.hello.useQuery(undefined, {
		enabled: shouldFetch,
	})

	// Update name when data arrives
	if (data?.name && name === 'unknown') {
		setName(data.name)
		setShouldFetch(false) // Reset to prevent re-fetching
	}

	return (
		<>
			<img src={reactLogo} className="logo react" alt="React logo" />
			<div className="card">
				<button
					onClick={() => setShouldFetch(true)}
					aria-label="get name"
					type="button"
				>
					Name from TRPC is: {name}
				</button>
				<p>
					Edit <code>src/worker/trpc/routes/demo.ts</code> to change the name
				</p>
			</div>
		</>
	)
}

export default DemoTrpcPage
