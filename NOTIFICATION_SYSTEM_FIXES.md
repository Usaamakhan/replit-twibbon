# FCM Notification System - Critical Fixes

**Date:** October 13, 2025  
**Status:** ✅ COMPLETED & ARCHITECT REVIEWED

## Problem Summary

Users were experiencing a critical bug where:
1. ✅ First notification was received successfully
2. ❌ Device token was automatically removed from database after first notification
3. ❌ No subsequent notifications could be received
4. ❌ Settings toggle appeared enabled but notifications didn't arrive (confusing UX)

## Root Causes Identified

### 1. **Indiscriminate Token Removal**
The send API was removing ALL failed tokens, including those with temporary/transient errors (network issues, rate limits, server unavailable).

**Industry Standard:** Only remove tokens for **permanent failures** (invalid token, unregistered token), NOT temporary failures.

### 2. **Missing Token Re-registration**
The `useFCM` hook retrieved existing tokens from cache but didn't re-register them with the server, so server-side deletions were never restored.

### 3. **Canonical Token Update Issues**
Firebase returns canonical (updated) tokens for better delivery, but the system wasn't handling these updates properly, leading to:
- Race conditions in batch operations
- Duplicate writes causing batch failures
- Tokens remaining outdated

## Solutions Implemented

### 1. **Smart Token Cleanup** (`/api/notifications/send/route.js`)

**Permanent Errors (REMOVE TOKEN):**
- `messaging/invalid-registration-token`
- `messaging/registration-token-not-registered`
- `messaging/invalid-argument`
- `messaging/mismatched-credential`
- `messaging/authentication-error`

**Transient Errors (RETAIN TOKEN):**
- `messaging/server-unavailable`
- `messaging/internal-error`
- `messaging/unavailable`
- `messaging/quota-exceeded`
- `messaging/third-party-auth-error`

**Unknown Errors:** Retained for safety (logged for monitoring)

### 2. **Canonical Token Handling** (`/api/notifications/send/route.js`)

**Fixed Implementation:**
- Deduplicates by canonical (new) token, not old token
- Groups all old tokens mapping to same canonical
- Ensures each canonical token written only ONCE per batch
- Uses `merge: true` for graceful handling of pre-existing tokens
- Deletes ALL old tokens in same atomic operation

**Prevents:**
- Batch write conflicts (duplicate document writes)
- Race conditions during token updates
- Data loss during canonical upgrades

### 3. **Token Re-registration** (`src/hooks/useFCM.js`)

**New Behavior:**
- When existing token is retrieved from cache, it's immediately re-registered with server
- Updates `lastUsed` timestamp
- Ensures server-side persistence even if token was deleted
- Prevents desync between client and server token state

### 4. **Enhanced Logging**

**Added Comprehensive Logging:**
- ✅ Success confirmations with token counts
- 📝 Canonical token updates with before/after info
- 🗑️ Permanent token removals with reasons
- ⚠️ Transient errors (retained for retry)
- 📊 Detailed metrics in API responses

## Expected Outcomes

✅ **Devices persist after first notification**  
✅ **Tokens survive transient network/server errors**  
✅ **Canonical token updates handled properly**  
✅ **Better error monitoring and debugging**  
✅ **Settings page accurately reflects device status**  
✅ **Toggle button state matches actual notification capability**

## API Response Format (Updated)

```json
{
  "success": true,
  "successCount": 1,
  "failureCount": 0,
  "tokensRemoved": 0,
  "tokensUpdated": 0,
  "transientErrors": 0,
  "message": "Sent 1 notifications, 0 failed (0 tokens removed, 0 transient errors)"
}
```

## Testing Recommendations

1. **Send multiple notifications to same user** - Verify device persists
2. **Test during network issues** - Verify tokens retained for transient errors
3. **Monitor canonical updates** - Check logs for token upgrade paths
4. **Verify settings page** - Confirm device list stays accurate
5. **Test toggle behavior** - Ensure UI state matches functionality

## Future Enhancements (Suggested by Architect)

1. **Regression Tests:** Add unit/integration tests for duplicate canonical responses
2. **Backwards Compatibility:** Add fallback to document IDs if `token` field missing
3. **Monitoring:** Track metrics around canonical upgrades under load
4. **Retry Logic:** Implement automatic retry for transient errors

## Architecture Review

✅ **Architect Approved** - All critical issues resolved:
- No race conditions in canonical token handling
- No duplicate writes in batch operations
- Proper error classification and handling
- Safe token lifecycle management

---

**Files Modified:**
- `src/app/api/notifications/send/route.js` - Smart token cleanup & canonical handling
- `src/hooks/useFCM.js` - Token re-registration on retrieval

**Lines Changed:** ~150 lines across 2 files
**Review Status:** ✅ Architect Approved
