import path from 'node:path'
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
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		port: 5999,
	},
})
