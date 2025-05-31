import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './styles.css'

function DemoPage() {
	const [name, setName] = useState('unknown')

	return (
		<>
			<div>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<div className="card">
				<button
					onClick={() => {
						fetch('/api/')
							.then((res) => res.json() as Promise<{ name: string }>)
							.then((data) => setName(data.name))
					}}
					aria-label="get name"
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