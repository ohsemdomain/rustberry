/// <reference types="@cloudflare/workers-types" />

declare global {
	// This makes the Cloudflare Workers types available globally
	interface CloudflareEnv {
		DB: D1Database
		rustyberry_kv: KVNamespace
		rustyberry_r2: R2Bucket
		JWT_SECRET: string
	}
}

// Export the Env type for use in function signatures
export interface Env extends CloudflareEnv {}
