I need a simple auth system with department-based authorization AND ownership rules:

CONTEXT:
- Small business internal app (5-10 users max)
- 5 departments: wildcard (admin/owner), sales, marketing, creative, hr
- Users can VIEW resources their department has access to
- Users can only EDIT/DELETE their own created resources
- Built with: React + tRPC + Cloudflare Workers

OWNERSHIP RULES:
1. VIEW: If your department has access to 'note', you can view ALL notes
2. EDIT/DELETE: You can only edit/delete YOUR OWN notes
3. WILDCARD: Can edit/delete ANYONE's resources (owner privilege)

EXAMPLE SCENARIOS:
- John (marketing) creates a note
- Sarah (sales) can VIEW John's note (sales has 'note' access)
- Sarah CANNOT edit/delete John's note
- Owner (wildcard) CAN edit/delete both John's and Sarah's notes

IMPLEMENTATION:
1. Add 'createdBy' field when creating any resource:
   ```typescript
   note: {
     id: '123',
     content: 'Meeting notes',
     createdBy: 'user-1', // John's ID
     createdAt: '2024-01-01'
   }

2. Create two types of middleware:

canView('note'): Check if department has access
canModify: Check if user owns resource OR is wildcard


3. tRPC procedures pattern

// List/Read - check department access only
listNotes: departmentProcedure('note').query(...)

// Create - check department access
createNote: departmentProcedure('note').mutation(...)

// Update/Delete - check ownership
updateNote: departmentProcedure('note')
  .use(checkOwnership) // additional middleware
  .mutation(...)

4. Simple ownership check:

Get resource by ID
Check if resource.createdBy === currentUser.id
OR if currentUser.department === 'wildcard'
Return 403 if neither condition is true

KEEP IT SIMPLE:

No complex permission levels
Just: department access + ownership check
Store createdBy as user ID string
Wildcard bypasses ownership checks

UI HINTS:

Show edit/delete buttons only for own items (or all if wildcard)
Show "Created by: John" on items for transparency
Different visual indicator for own vs others' items

**The key addition is the ownership check:**
Can view? → Department has access
Can edit/delete? → You created it OR you're wildcard

-------------

IMPORTANT CLARIFICATION:
- The resources mentioned (note, task, invoice) are just EXAMPLES
- DO NOT create these resources yet
- Focus ONLY on implementing the auth system first
- Use the existing demo pages to test authentication
- The permissions object should include the example resources for future use, but we won't create the actual resources now

INITIAL IMPLEMENTATION:
1. Create the auth system with login/logout
2. Protect the existing demo routes (trpc-demo, hono-demo) to test
3. Show user info and department after login
4. Resources (note, task, invoice) will be added LATER by me

The goal is to have a working auth foundation that I can build upon later.

IMPORTANT - PACKAGE MANAGER:
- This project uses Bun, NOT npm or yarn
- Use "bun add" instead of "npm install"
- Use "bun run" instead of "npm run"
- The project already has bun configured

Examples:
- Installing packages: bun add jose
- Running scripts: bun run dev
- Installing dev dependencies: bun add -d package-name

DO NOT use npm, yarn, or pnpm commands!

IMPORTANT - PASSWORD HASHING:
- Use Web Crypto API for password hashing (built into Workers)
- DO NOT use @node-rs/argon2 or bcrypt (they don't work in Workers)
- Use crypto.subtle with PBKDF2 or the Workers-specific password hashing

Example using Web Crypto API:
```typescript
// Hash password
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  )
  // Combine salt + hash and convert to base64
  const combined = new Uint8Array(salt.length + hash.byteLength)
  combined.set(salt)
  combined.set(new Uint8Array(hash), salt.length)
  return btoa(String.fromCharCode(...combined))
}

AUTHENTICATION LIBRARIES:
- JWT: Use "jose" (works perfectly with Cloudflare Workers)
- Password hashing: Use Web Crypto API (built-in, no library needed)

Dependencies needed:
- bun add jose

JWT example with jose:
```typescript
import { SignJWT, jwtVerify } from 'jose'

// Create JWT
const secret = new TextEncoder().encode(env.MY_SECRET)
const token = await new SignJWT({ userId, department })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('30d')
  .sign(secret)

// Verify JWT
const { payload } = await jwtVerify(token, secret)

- **JWT**: jose ✅
- **Passwords**: Web Crypto API ✅
- **Storage**: Existing KV namespace ✅