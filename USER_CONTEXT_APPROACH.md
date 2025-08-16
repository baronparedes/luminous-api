# User Context Approach for Audit System

## Overview

Instead of passing `AuthProfile` through every service constructor, we now use a **User Context** pattern that allows services to access the current authenticated user transparently.

## How It Works

### 1. User Context Manager (`src/@utils/user-context.ts`)
- Singleton pattern to store current user per request
- Thread-safe for the Node.js event loop
- Provides methods to set, get, and clear user context

### 2. Authentication Integration (`src/auth.ts`)
- Modified `expressAuthentication` to set user context automatically
- Every authenticated request now populates the context

### 3. Middleware for Cleanup (`src/@utils/clear-user-context-middleware.ts`)
- Ensures user context is cleared after each request
- Prevents context leakage between requests

### 4. Service Layer Simplification
- Services no longer need `AuthProfile` in constructor
- Audit operations automatically use current user from context
- Cleaner service instantiation in controllers

## Usage Examples

### Before (Old Approach) ❌
```typescript
// Controller
export class SettingController extends Controller {
  @Patch('/updateSettingValue')
  public async updateSettingValue(
    @Body() setting: SettingAttr,
    @Request() request: ApprovedAny
  ) {
    const settingService = new SettingService(CONSTANTS.COMMUNITY_ID, request.user);
    await settingService.setValue(setting.key, setting.value);
  }
}

// Service
export default class SettingService extends BaseServiceWithAudit {
  constructor(private communityId: number, currentUser: AuthProfile) {
    super(currentUser);
  }
}
```

### After (New Approach) ✅
```typescript
// Controller - Much simpler!
export class SettingController extends Controller {
  @Patch('/updateSettingValue')
  public async updateSettingValue(@Body() setting: SettingAttr) {
    const settingService = new SettingService(CONSTANTS.COMMUNITY_ID);
    await settingService.setValue(setting.key, setting.value);
  }
}

// Service - No user parameter needed!
export default class SettingService extends BaseServiceWithAudit {
  constructor(private communityId: number) {
    super();
  }
}
```

### In Services - Automatic Audit
```typescript
export default class SettingService extends BaseServiceWithAudit {
  public async setValue(key: string, value: string) {
    const existing = await Setting.findOne({where: {key}});
    
    if (existing) {
      existing.value = value;
      // User context automatically provides userId for audit
      await this.saveWithAudit(existing);
    } else {
      // User context automatically provides userId for audit
      await this.createWithAudit(Setting, {key, value, communityId: this.communityId});
    }
  }
}
```

## Key Benefits

### 1. **Cleaner Controllers**
- No need to extract user from request and pass to every service
- Controllers focus on request/response logic, not plumbing
- Consistent pattern across all endpoints

### 2. **Simpler Service Constructors**
- Services only receive domain-specific parameters
- No authentication concerns mixed with business logic
- Easier to test and mock

### 3. **Automatic Audit Trail**
- All audit operations automatically get current user
- No risk of forgetting to pass user context
- Consistent audit behavior across the application

### 4. **Type Safety Maintained**
- All existing TypeScript benefits preserved
- Context provides proper AuthProfile typing
- Compile-time safety for audit operations

## Implementation Status

### ✅ Completed
- `UserContext` utility with singleton pattern
- `expressAuthentication` updated to set context
- `clearUserContext` middleware for cleanup
- `BaseServiceWithAudit` updated to use context
- `SettingService` converted to new pattern
- Middleware integrated into Express app

### 🔄 Ready for Conversion
All other services can now be easily converted:

```typescript
// Before
constructor(communityId: number, currentUser: AuthProfile) {
  super(currentUser);
}

// After
constructor(communityId: number) {
  super();
}
```

## Security Considerations

### Context Isolation
- Middleware ensures context is cleared after each request
- No risk of user context bleeding between requests
- Singleton pattern is safe in Node.js single-threaded event loop

### Error Handling
- `requireCurrentUser()` throws if no user in context
- Graceful handling of unauthenticated scenarios
- Clear error messages for debugging

## Testing

### Unit Tests
```typescript
// Mock user context for tests
beforeEach(() => {
  const mockUser = {id: 1, username: 'test', email: 'test@example.com'};
  UserContext.setCurrentUser(mockUser);
});

afterEach(() => {
  UserContext.clearCurrentUser();
});
```

### Integration Tests
- Context is automatically set by authentication middleware
- No special setup needed for authenticated endpoints
- Clear separation of concerns

## Migration Path

1. **Phase 1**: Core services (Setting, Category, Property)
2. **Phase 2**: Business logic services (Transaction, Charge)  
3. **Phase 3**: Request processing services (PurchaseRequest, etc.)

Each service conversion follows the same simple pattern:
1. Remove `AuthProfile` parameter from constructor
2. Update `super()` call to not pass user
3. Remove `currentUser` property and assignment

Controllers automatically become cleaner without any changes to their business logic!
