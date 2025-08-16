# 🚨 React Troubleshooting Guide - Critical Bug Fixes & Lessons Learned

## 🎯 Purpose

This document captures critical bugs we've encountered and their solutions to prevent repeat incidents. Every bug here represents a lesson learned the hard way! 💪✨

## 💥 Critical Bug #1: Infinite Re-render Loop (August 16, 2025)

### 🐛 Problem Description

**Symptoms**: Blank screen, app never loads, infinite console warnings, browser becomes unresponsive

**Root Cause**: useEffect with circular dependencies causing infinite re-renders

### 🔍 The Bug in Detail

```typescript
// ❌ DANGEROUS CODE - This creates an infinite loop!
useEffect(() => {
  // If partners already exist but we haven't marked as initialized, mark it now
  if (!partnersInitialized && currentPartner && otherPartner) {
    setPartnersInitialized(true); // ← Triggers effect again!
  }
  // Only create default partners if none exist and we haven't tried before
  else if (!partnersInitialized && (!currentPartner || !otherPartner)) {
    setCurrentPartner(defaultCurrentPartner);  // ← Triggers effect again!
    setOtherPartner(defaultOtherPartner);      // ← Triggers effect again!
    setPartnersInitialized(true);             // ← Triggers effect again!
  }
}, [partnersInitialized, currentPartner, otherPartner]); // ← THE PROBLEM!
```

**Why this happens:**

1. Effect runs initially
2. Effect calls `setPartnersInitialized(true)`
3. State change triggers re-render
4. Re-render triggers effect again (because `partnersInitialized` is in dependencies)
5. Effect runs again... **INFINITE LOOP!** 🔄💥

### ✅ The Solution

```typescript
// ✅ CORRECT - Empty dependency array for one-time initialization
useEffect(() => {
  // Only run this effect once
  if (partnersInitialized) return;

  // If partners already exist, just mark as initialized
  if (currentPartner && otherPartner) {
    console.warn('✅ Partners already exist, marking as initialized');
    setPartnersInitialized(true);
    return;
  }

  // Create default partners if none exist
  console.warn('🚀 Initializing default partners...');

  const defaultCurrentPartner: Partner = {
    id: 'partner-1',
    name: 'You',
    email: 'you@example.com',
    isCurrentUser: true,
  };
  const defaultOtherPartner: Partner = {
    id: 'partner-2',
    name: 'Your Partner',
    email: 'partner@example.com',
    isCurrentUser: false,
  };

  // Set partners and mark as initialized
  setCurrentPartner(defaultCurrentPartner);
  setOtherPartner(defaultOtherPartner);
  setPartnersInitialized(true);
}, []); // ← EMPTY ARRAY = runs only once on mount
```

### 🛡️ Prevention Strategies

#### 1. useEffect Dependency Rules

```typescript
// ✅ One-time initialization
useEffect(() => {
  initializeApp();
}, []); // Empty array

// ✅ Reactive to external changes only
useEffect(() => {
  updateBasedOnProps();
}, [externalProp]); // Only dependencies we don't modify

// ✅ Derived state (be very careful!)
useEffect(() => {
  if (user && !profile) {
    fetchProfile(user.id); // Only modify 'profile', not 'user'
  }
}, [user, profile]); // Safe because we don't modify 'user' in this effect

// ❌ DANGEROUS - Circular dependency
useEffect(() => {
  if (condition) {
    setMyState(newValue); // We're modifying myState...
  }
}, [myState, condition]); // ...but myState is in dependencies! 💥
```

#### 2. Early Detection Techniques

**Look for these patterns in code reviews:**

```typescript
// 🚨 RED FLAG: State setter inside effect that depends on that state
useEffect(() => {
  setSomeState(value);
}, [someState]); // ← DANGER!

// 🚨 RED FLAG: Multiple state setters in effect with those states as dependencies
useEffect(() => {
  setState1(value1);
  setState2(value2);
}, [state1, state2]); // ← DOUBLE DANGER!

// ✅ SAFE: External dependencies only
useEffect(() => {
  if (props.userId !== lastUserId) {
    fetchUserData(props.userId);
    setLastUserId(props.userId);
  }
}, [props.userId]); // ← Safe, we're not setting props.userId
```

#### 3. Debugging Techniques

**Add debug logging to spot infinite loops:**

```typescript
useEffect(() => {
  console.warn('🔍 Effect running with:', {
    partnersInitialized,
    currentPartner: currentPartner?.name,
    otherPartner: otherPartner?.name
  });

  // Your effect logic here...
}, [partnersInitialized, currentPartner, otherPartner]);
```

**If you see this logging repeatedly, you have an infinite loop!**

### 🔧 Quick Fix Checklist

When you encounter a blank screen:

1. **Check the browser console** - Look for repeated warnings/errors
2. **Look for useEffect with state dependencies** that the effect modifies
3. **Temporarily add debug logging** to see which effects are running repeatedly
4. **Consider if the effect should run once** (empty dependencies) or reactively
5. **Separate initialization logic** from reactive updates

### 📚 Related Patterns

#### Pattern 1: Initialization vs. Reactive Updates

```typescript
// ✅ Separate concerns
// One-time initialization
useEffect(() => {
  initializeApp();
}, []);

// Reactive updates
useEffect(() => {
  if (user) {
    updateUserRelatedData(user);
  }
}, [user]);
```

#### Pattern 2: Conditional State Updates

```typescript
// ✅ Use functional updates to avoid dependencies
const handleUpdate = useCallback(() => {
  setCount(prev => prev + 1); // No need to depend on 'count'
}, []); // Empty dependencies because we use functional update

useEffect(() => {
  if (shouldUpdate) {
    handleUpdate();
  }
}, [shouldUpdate, handleUpdate]); // Safe!
```

#### Pattern 3: Complex Initialization Logic

```typescript
// ✅ Use useReducer for complex state logic
const [state, dispatch] = useReducer(appReducer, initialState);

useEffect(() => {
  dispatch({ type: 'INITIALIZE' });
}, []); // Simple, no dependencies on state
```

## 💥 Critical Bug #2: React 19 Scheduler Error (August 16, 2025)

### 🐛 Problem Description

**Symptoms**: Console error `Cannot set properties of undefined (setting 'unstable_now')`

**Root Cause**: React 19 compatibility issue with Vite development server

### 🔍 The Bug in Detail

```javascript
// Error in browser console:
// Uncaught TypeError: Cannot set properties of undefined (setting 'unstable_now')
//     at chunk-CnXZgr9S.js:1:1507
```

**Why this happens:**

1. React 19 expects the scheduler to be available globally
2. Vite development server doesn't always provide the scheduler polyfill
3. Results in runtime error when React tries to set scheduler properties

### ✅ The Solution

```typescript
// In src/main.tsx - Add before React initialization
// Fix for React 19 scheduler issue with Vite
// @ts-expect-error - globalThis.scheduler might not exist
if (typeof globalThis.scheduler === 'undefined') {
  // @ts-expect-error - Adding missing scheduler polyfill
  globalThis.scheduler = {
    unstable_now: () => performance.now(),
  };
}
```

**For production builds**, also add to `index.html` before any React scripts:

```html
<!-- React 19 Scheduler Fix - Must be loaded early -->
<script>
  // Fix for React 19 scheduler issue with Vite in production
  if (typeof globalThis.scheduler === 'undefined') {
    globalThis.scheduler = {
      unstable_now: function() { return performance.now(); }
    };
  }
</script>
```

### 🛡️ Prevention Strategies

1. **Always test with React 19** - Ensure compatibility with latest React version
2. **Check browser console** - Look for scheduler-related errors during development
3. **Add polyfills early** - Initialize missing globals before React startup

## 💥 Critical Bug #3: Content Security Policy Violations (August 16, 2025)

### 🐛 Problem Description

**Symptoms**: External resources blocked by CSP, analytics and fonts not loading

**Root Cause**: Overly restrictive Content Security Policy headers

### 🔍 The Bug in Detail

```
Refused to load the script 'https://static.cloudflareinsights.com/beacon.min.js'
because it violates the following Content Security Policy directive:
"script-src 'self' 'unsafe-inline'".
```

### ✅ The Solution

Update `public/_headers` file to allow trusted external resources:

```yaml
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss:
```

### 🛡️ Prevention Strategies

1. **Test CSP thoroughly** - Verify all external resources are whitelisted
2. **Use specific domains** - Don't use wildcard (*) unless necessary
3. **Monitor browser console** - CSP violations show up clearly in console

## 💥 Critical Bug #4: Cloudflare Pages Deployment Config Error (August 16, 2025)

### 🐛 Problem Description

**Symptoms**: Cloudflare Pages build failing with wrangler.toml configuration errors

**Root Cause**: Using Workers configuration format for Pages deployment

### 🔍 The Bug in Detail

```
✘ [ERROR] Running configuration file validation for Pages:
    - Configuration file for Pages projects does not support "build"
    - Unexpected fields found in build field: "environment","caching"
```

**Why this happens:**

1. Cloudflare Pages uses a much simpler configuration model than Workers
2. Most configuration is done through the dashboard, not wrangler.toml
3. Complex Workers configurations are incompatible with Pages

### ✅ The Solution

Simplify wrangler.toml to minimal Pages configuration:

```toml
# 💕 Cloudflare Pages configuration for Couple Connect
name = "couple-connect"
compatibility_date = "2024-08-14"

# Pages build configuration
pages_build_output_dir = "dist"
```

Remove all `[build]`, `[env.*]`, database bindings, and KV configurations - these are configured in the dashboard for Pages.

### 🛡️ Prevention Strategies

1. **Use separate configs** - Keep different wrangler.toml files for Workers vs Pages
2. **Check Cloudflare docs** - Pages and Workers have different configuration requirements
3. **Test deployment early** - Validate configuration changes with actual deployments

## 🎯 General Debugging Strategies

### Console Debugging

```typescript
// Add detailed logging to track state changes
useEffect(() => {
  console.warn('🏁 Component mounting/updating:', {
    prop1,
    prop2,
    state1,
    state2,
    timestamp: new Date().toISOString()
  });
}, [prop1, prop2, state1, state2]);
```

### React DevTools

1. Install React Developer Tools browser extension
2. Use the "Profiler" tab to spot performance issues
3. Use the "Components" tab to inspect state and props
4. Look for components that update too frequently

### Performance Monitoring

```typescript
// Add performance markers for critical operations
useEffect(() => {
  performance.mark('partners-init-start');

  initializePartners();

  performance.mark('partners-init-end');
  performance.measure('partners-init', 'partners-init-start', 'partners-init-end');
}, []);
```

## 📖 Additional Resources

- [React useEffect Documentation](https://react.dev/reference/react/useEffect)
- [React Strict Mode Documentation](https://react.dev/reference/react/StrictMode)
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/)

## 🎪 Remember: Code with Love, Debug with Patience! 💕

Every bug is a learning opportunity. Document them well, fix them thoroughly, and prevent them passionately! 🚀✨

---

**Last Updated**: August 16, 2025
**Next Review**: When we encounter the next critical bug (hopefully never! 🤞)
