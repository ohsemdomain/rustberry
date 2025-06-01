import reactLogo from '@/app/assets/react.svg'
import { useState } from 'react'
import '@/app/styles.css'

function DemoPage() {
	const [name, setName] = useState('unknown')

	return (
		<>
			<img src={reactLogo} className="logo react" alt="React logo" />
			<div className="card">
				<button
					onClick={() => {
						fetch('/api/')
							.then((res) => res.json() as Promise<{ name: string }>)
							.then((data) => setName(data.name))
					}}
					aria-label="get name"
					type="button"
				>
					Name from API is: {name}
				</button>
				<p>
					Edit <code>src/worker/index.ts</code> to change the name
				</p>
			</div>
		</>
	)
}

export default DemoPage
