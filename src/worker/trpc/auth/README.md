# Auth Registry

Centralized permission management for all resources.

## Overview

All permissions are managed in `auth-registry.ts` - a single source of truth for who can do what.

## Usage

### Checking Permissions in Routes

```typescript
import { canPerformAction } from '~/trpc/auth/auth-registry'

// In your route handler
if (!canPerformAction(ctx.user.department, 'items', 'create')) {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'You do not have permission to create items',
  })
}
```

### Adding New Resources

1. Add the resource to `ResourceType` in `~/auth/types.ts`:
```typescript
export type ResourceType = 'note' | 'task' | 'invoice' | 'items' | 'newResource'
```

2. Add permissions in `auth-registry.ts`:
```typescript
export const permissionRegistry: Record<ResourceType, ResourcePermissions> = {
  // ... existing resources
  newResource: {
    create: ['wildcard', 'sales'],
    read: ['wildcard', 'sales', 'marketing'],
    update: ['wildcard', 'sales'],
    delete: ['wildcard'],
  },
}
```

### Updating Permissions

Need to change who can access items? Just update `auth-registry.ts`:

```typescript
// Before: Only wildcard & sales
items: {
  create: ['wildcard', 'sales'],
  // ...
}

// After: Add marketing team
items: {
  create: ['wildcard', 'sales', 'marketing'],
  // ...
}
```

## Helper Functions

- `canPerformAction(department, resource, action)` - Check if user can perform action
- `hasResourceAccess(department, resource)` - Check if user has any access to resource
- `getAccessibleResources(department)` - Get all resources user can access
- `getDepartmentsWithAccess(resource, action)` - Get departments with specific access

## Benefits

✅ **Single source of truth** - All permissions in one place  
✅ **Easy to maintain** - Change permissions without hunting through code  
✅ **Consistent** - Same permission logic everywhere  
✅ **Scalable** - Easy to add new resources and roles  
✅ **Auditable** - Can see all permissions at a glance  

## Example: Adding Customer Resource

```typescript
// 1. Add to types
export type ResourceType = '...' | 'customers'

// 2. Add to registry
customers: {
  create: ['wildcard', 'sales'],
  read: ['wildcard', 'sales', 'marketing'],
  update: ['wildcard', 'sales'],
  delete: ['wildcard'],
},

// 3. Use in routes
if (!canPerformAction(ctx.user.department, 'customers', 'create')) {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
}
```

That's it! No need to update multiple files or remember where permissions are checked.