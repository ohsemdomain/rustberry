// src/app/DemoTrpcPage.tsx
import { useState } from 'react'
import { trpc } from './trpc'
import reactLogo from './assets/react.svg'
import './styles.css'

function DemoTrpcPage() {
	const [name, setName] = useState('unknown')

	// Create the tRPC mutation (for on-demand fetching like the Hono demo)
	const helloQuery = trpc.demo.hello.useQuery(undefined, {
		enabled: false, // Don't fetch automatically
		onSuccess: (data) => {
			setName(data.name)
		},
	})

	return (
		<>
			<div>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<div className="card">
				<button onClick={() => helloQuery.refetch()} aria-label="get name">
					Name from tRPC is: {name}
				</button>
				<p>
					Edit <code>src/worker/trpc/routes/demo.ts</code> to change the name
				</p>
			</div>
		</>
	)
}

export default DemoTrpcPage
