import { useAuth } from '@/app/AuthProvider'
import { trpc } from '@/app/trpc'
import { useState } from 'react'

interface LoginFormProps {
	onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const { login } = useAuth()

	const loginMutation = trpc.auth.login.useMutation({
		onSuccess: (data) => {
			// Auth context with token and user
			login(data.token, data.user)
			setError('')
			if (onSuccess) {
				onSuccess()
			}
		},
		onError: (error) => {
			setError(error.message)
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		loginMutation.mutate({ email, password })
	}

	return (
		<form onSubmit={handleSubmit} className="login-form">
			<h2>Login</h2>

			{error && (
				<div
					className="error-message"
					style={{ color: 'red', marginBottom: '1rem' }}
				>
					{error}
				</div>
			)}

			<div className="form-group" style={{ marginBottom: '1rem' }}>
				<label htmlFor="email">Email:</label>
				<input
					type="email"
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					style={{
						display: 'block',
						width: '100%',
						padding: '0.5rem',
						marginTop: '0.25rem',
					}}
				/>
			</div>

			<div className="form-group" style={{ marginBottom: '1rem' }}>
				<label htmlFor="password">Password:</label>
				<input
					type="password"
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					style={{
						display: 'block',
						width: '100%',
						padding: '0.5rem',
						marginTop: '0.25rem',
					}}
				/>
			</div>

			<button
				type="submit"
				disabled={loginMutation.isPending}
				style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
			>
				{loginMutation.isPending ? 'Logging in...' : 'Login'}
			</button>
		</form>
	)
}
