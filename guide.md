# User Management Guide

## Initial Setup (First Time Only)
```bash
cp src/worker/auth/users.ts.example src/worker/auth/users.ts
```

## How to Add a New User

### Step 1: Generate Password Hash
```bash
bun run src/worker/auth/hash-password.ts "your_password_here"
```

### Step 2: Add User to `src/worker/auth/users.ts`
```typescript
export const users: Record<string, StoredUser> = {
  'user-2': {
    id: 'user-2',
    email: 'new-user@company.com',
    name: 'New User Name',
    department: 'sales', // wildcard | sales | marketing | creative | hr
    createdAt: '2024-12-01T00:00:00Z',
    passwordHash: 'PASTE_GENERATED_HASH_HERE'
  },
  // ... existing users
}
```

### Step 3: Deploy
```bash
bun run deploy
```

## Department Access Levels
- **wildcard**: Admin - access to everything + can edit anyone's data
- **sales**: Access to notes, tasks, invoices
- **marketing**: Access to notes, tasks
- **creative**: Access to notes, tasks  
- **hr**: Access to notes, invoices

## Security Notes
- ⚠️ Never commit plain text passwords
- ⚠️ Always generate new password hashes
- ⚠️ Use strong passwords for production