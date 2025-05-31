import { cloudflare } from '@cloudflare/vite-plugin'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		TanStackRouterVite({
			routesDirectory: './src/app/routes',
			generatedRouteTree: './src/app/routeTree.gen.ts',
		}),
		react(),
		cloudflare(),
	],
	server: {
		port: 5999,
	},
})
