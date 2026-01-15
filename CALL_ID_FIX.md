# Fix for "unknown" call_id Issue

## Problem
The out-of-office transfer service is receiving `"call_id":"unknown"` from Retell, causing transfer failures with the error:
```
Cannot POST /v2/calls/unknown/transfer
```

## Root Cause
Retell's custom function configuration is sending the literal string `"unknown"` instead of the actual call ID variable.

## Solution Applied

### 1. Code Updates (`apps/backend/src/routes/retell.ts`)
- ✅ Added header logging to debug where call_id might be sent
- ✅ Added fallback to check headers for call_id (in case Retell sends it there)
- ✅ Added validation to reject `"unknown"` as an invalid call_id
- ✅ Improved error messages to guide users on fixing Retell configuration

### 2. Documentation Updates (`RETELL_SETUP_INSTRUCTIONS.md`)
- ✅ Added specific instructions on how to configure call_id variable
- ✅ Added troubleshooting section for "unknown" call_id issue
- ✅ Provided example JSON payload with correct variable syntax

## Action Required: Fix Retell Configuration

**You need to update the Retell custom function configuration** to use the correct call_id variable:

1. **Go to Retell Dashboard** → Your Agent → Custom Functions
2. **Find the Out-of-Office Transfer function**
3. **Check the Request Payload configuration**
4. **Update the `call_id` field** to use a Retell variable instead of "unknown"

### Correct Configuration:
```json
{
  "call_id": "{{call.call_id}}",
  "project_id": "org_P5F0bnCrRcdlNtZk",
  "function_id": "RETELL_TRANSFER_WEEKDAYS"
}
```

### Common Variable Names (check Retell docs for your version):
- `{{call.call_id}}`
- `{{call_id}}`
- `{{context.call_id}}`
- `{{variables.call_id}}`

## Testing After Fix

1. Update the Retell configuration with the correct call_id variable
2. Make a test call
3. Check Cloud Run logs to verify the call_id is now a real ID (not "unknown")
4. The transfer should now work correctly

## Deployment

After fixing the Retell configuration, the service will:
- ✅ Reject "unknown" call_ids with a clear error message
- ✅ Log all headers for debugging
- ✅ Attempt to get call_id from headers if not in body
- ✅ Provide better error messages

**No code deployment needed** - the code changes will be deployed automatically on the next build, but the immediate fix is updating the Retell configuration.

## Monitoring

Check Cloud Run logs to verify:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=out-of-office-transfer" --limit=50 --format="table(timestamp,textPayload)" --project=pet-store-direct
```

Look for log entries showing the actual call_id (should be a long string like `call_abc123...`, not "unknown").
