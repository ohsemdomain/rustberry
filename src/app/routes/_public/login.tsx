import { useAuth } from '@/app/AuthProvider'
import { LoginForm } from '@/app/components/LoginForm'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_public/login')({
	component: LoginPage,
})

function LoginPage() {
	const navigate = useNavigate()
	const { user } = useAuth()

	useEffect(() => {
		if (user) {
			navigate({ to: '/' })
		}
	}, [user, navigate])

	const handleLoginSuccess = () => {
		navigate({ to: '/' })
	}

	return (
		<div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
			<LoginForm onSuccess={handleLoginSuccess} />
		</div>
	)
}
