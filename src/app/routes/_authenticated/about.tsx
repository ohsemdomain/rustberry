import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/about')({
	component: About,
})

function About() {
	return (
		<div>
			<h1>About Page</h1>
			<p>This is the about page.</p>
		</div>
	)
}
