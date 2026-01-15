# Testing the Out-of-Office Transfer Custom Function

## Prerequisites

1. ✅ Retell agent configuration updated with correct `call_id` variable
2. ✅ Cloud Run service is running
3. ✅ Authentication configured (RETELL_SHARED_SECRET)

## Testing Methods

### Method 1: Make a Real Phone Call (Recommended)

This is the most accurate test since it uses the actual Retell infrastructure.

#### Steps:
1. **Make a test call** to your Retell agent phone number
2. **Trigger the transfer function** during the call (if it's configured to trigger automatically, or trigger it manually)
3. **Check the logs** to verify it's working

#### What to Look For:
- ✅ Call should transfer during business hours
- ✅ Call should be denied with message outside business hours
- ✅ Logs should show a real call_id (not "unknown")

### Method 2: Check Recent Call Logs

If you already made calls, check the logs to see if they're working now.

### Method 3: Manual API Test (Limited)

You can test the endpoint directly, but it won't have a real call_id unless you use one from an actual call.

## Step-by-Step Testing Guide

### Step 1: Verify Configuration is Updated

1. Go to Retell Dashboard → Your Agent → Custom Functions
2. Verify the request body shows:
   ```json
   {
     "call_id": "{{call.call_id}}",
     "project_id": "org_P5F0bnCrRcdlNtZk",
     "function_id": "RETELL_TRANSFER_WEEKDAYS"
   }
   ```
3. **NOT** `"call_id": "unknown"`

### Step 2: Check Current Time

The function checks business hours, so verify:
- **Weekdays (Mon-Fri)**: 9:00 AM - 8:50 PM EST
- **Saturday**: 9:00 AM - 4:50 PM EST
- **Sunday**: Always denied

### Step 3: Make a Test Call

1. Call your Retell agent phone number
2. The agent should trigger the custom function
3. During business hours: Call should transfer
4. Outside business hours: Call should be denied with message

### Step 4: Check Cloud Run Logs

After making a call, check the logs to verify:

```bash
export PATH="/Users/developer/google-cloud-sdk/bin:$PATH"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=out-of-office-transfer" --limit=20 --format="table(timestamp,textPayload)" --project=pet-store-direct
```

**Look for:**
- ✅ `"call_id":"call_abc123..."` (real call ID, NOT "unknown")
- ✅ `Transfer allowed: true` or `Transfer denied: [reason]`
- ✅ No errors about "unknown" call_id

### Step 5: Verify Transfer (If During Business Hours)

If the call was during business hours:
- The call should transfer to: `+18563630633`
- Check Retell call logs to confirm transfer happened

### Step 6: Verify Denial (If Outside Business Hours)

If the call was outside business hours:
- The agent should say: "I really wish I could connect you right now, but our team isn't available at the moment..."
- No transfer should occur

## Testing Different Scenarios

### Test 1: Weekday During Business Hours
- **Time**: Monday-Friday, 10:00 AM EST
- **Expected**: Transfer allowed ✅

### Test 2: Weekday Outside Business Hours
- **Time**: Monday-Friday, 9:00 PM EST
- **Expected**: Transfer denied with message ✅

### Test 3: Saturday During Business Hours
- **Time**: Saturday, 12:00 PM EST
- **Expected**: Transfer allowed ✅

### Test 4: Saturday Outside Business Hours
- **Time**: Saturday, 6:00 PM EST
- **Expected**: Transfer denied with message ✅

### Test 5: Sunday (Any Time)
- **Time**: Sunday, any time
- **Expected**: Transfer denied with message ✅

## Troubleshooting

### Issue: Still seeing "unknown" call_id in logs

**Solution**: 
- Double-check Retell configuration
- Make sure you saved the changes
- Try a new call (old calls won't be affected)

### Issue: Transfer not happening during business hours

**Check:**
1. Logs show `transfer_allowed: true`
2. Transfer number is configured: `+18563630633`
3. Retell API key is valid
4. Call is actually during business hours (check timezone: EST/EDT)

### Issue: Getting 401 Unauthorized

**Solution**: 
- Verify RETELL_SHARED_SECRET is set correctly
- Check Authorization header in Retell configuration

### Issue: Function not being triggered

**Check:**
1. Custom function is enabled in Retell
2. Function is configured to trigger at the right point in the conversation
3. Agent is using the correct function_id

## Quick Test Script

I've created a test script you can run to check recent logs and verify the function is working.
