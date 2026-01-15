# Retell Custom Function Setup Instructions

## Overview
This document provides step-by-step instructions for configuring the Out-of-Office Transfer Custom Function in Retell AI.

## System Status
✅ **Backend Deployed**: Cloud Run service is live and tested  
✅ **Configuration Saved**: Business hours and transfer settings are configured  
✅ **Function Tested**: All scenarios verified and working correctly

---

## Configuration Details

### 1. Custom Function URL
Set the webhook URL in Retell's Custom Function settings:

```
https://out-of-office-transfer-880489367524.us-central1.run.app/retell/transfer
```

### 2. Authentication (Optional)
If Retell supports custom headers, add:

- **Header Name**: `Authorization`
- **Header Value**: `Bearer <retell-shared-secret>`

*Note: If Retell doesn't support custom headers, authentication can be made optional.*

### 3. Request Payload Format
Retell should send a POST request with the following JSON structure:

```json
{
  "call_id": "<retell-call-id>",
  "project_id": "org_P5F0bnCrRcdlNtZk",
  "function_id": "RETELL_TRANSFER_WEEKDAYS"
}
```

### 4. Available Function IDs

#### RETELL_TRANSFER_WEEKDAYS
- **Days**: Monday through Friday
- **Hours**: 9:00 AM - 8:50 PM EST
- **Use Case**: Standard weekday business hours

#### RETELL_TRANSFER_SATURDAY
- **Days**: Saturday only
- **Hours**: 9:00 AM - 4:50 PM EST
- **Use Case**: Saturday business hours

---

## Configuration Steps in Retell

### Step 1: Access Custom Functions
1. Log into Retell AI Dashboard
2. Navigate to your agent settings
3. Find the "Custom Functions" or "Webhooks" section

### Step 2: Create New Custom Function
1. Click "Add Custom Function" or "Create Webhook"
2. Name it: "Out-of-Office Transfer" (or your preferred name)

### Step 3: Configure the Endpoint
1. **Method**: POST
2. **URL**: `https://out-of-office-transfer-880489367524.us-central1.run.app/retell/transfer`
3. **Content-Type**: `application/json`

### Step 4: Set Request Payload
Configure Retell to send:
- `call_id`: **IMPORTANT** - Use Retell's call ID variable. Common variable names:
  - `{{call.call_id}}` or `{{call_id}}` or `{{context.call_id}}`
  - **DO NOT** use the literal string "unknown" - this will cause transfer failures
  - If unsure, check Retell's documentation for the correct variable name for call ID in custom functions
- `project_id`: `org_P5F0bnCrRcdlNtZk` (fixed value)
- `function_id`: Choose one:
  - `RETELL_TRANSFER_WEEKDAYS` for weekday calls
  - `RETELL_TRANSFER_SATURDAY` for Saturday calls

**Example JSON payload configuration:**
```json
{
  "call_id": "{{call.call_id}}",
  "project_id": "org_P5F0bnCrRcdlNtZk",
  "function_id": "RETELL_TRANSFER_WEEKDAYS"
}
```

### Step 5: Configure Authentication (if supported)
If Retell supports custom headers:
- Add header: `Authorization`
- Value: `Bearer <your-retell-shared-secret>`
- *Contact your system administrator for the secret value*

---

## Expected Responses

### Transfer Allowed (During Business Hours)
```json
{
  "transfer_allowed": true,
  "transfer_attempted": true,
  "message": "Transfer initiated"
}
```

### Transfer Denied (Outside Business Hours)
```json
{
  "transfer_allowed": false,
  "transfer_attempted": false,
  "message": "I really wish I could connect you right now, but our team isn't available at the moment. I can create a support ticket so they can get back to you as soon as possible.",
  "reason": "Outside allowed hours"
}
```

### Transfer Denied (Wrong Day)
```json
{
  "transfer_allowed": false,
  "transfer_attempted": false,
  "message": "I really wish I could connect you right now, but our team isn't available at the moment. I can create a support ticket so they can get back to you as soon as possible.",
  "reason": "Day friday not allowed"
}
```

### Error Responses
- **Function Not Found**: `{"error": true, "message": "Function not found"}`
- **Config Not Found**: `{"error": true, "message": "Config not found"}`
- **Missing Fields**: `{"error": true, "message": "Missing required fields"}`

---

## Business Hours Configuration

### Current Settings
- **Timezone**: America/New_York (EST/EDT)
- **Transfer Number**: +18563630633
- **Agent ID**: agent_0f5125f801f3502acfe5e2e0f2

### Weekday Schedule
- **Days**: Monday, Tuesday, Wednesday, Thursday, Friday
- **Hours**: 09:00 - 20:50 EST

### Saturday Schedule
- **Days**: Saturday
- **Hours**: 09:00 - 16:50 EST

### Deny Message
When transfers are not allowed, callers will hear:
> "I really wish I could connect you right now, but our team isn't available at the moment. I can create a support ticket so they can get back to you as soon as possible."

---

## Testing

### Manual Test
You can test the function using curl:

```bash
curl -X POST "https://out-of-office-transfer-880489367524.us-central1.run.app/retell/transfer" \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test-call-123",
    "project_id": "org_P5F0bnCrRcdlNtZk",
    "function_id": "RETELL_TRANSFER_WEEKDAYS"
  }'
```

### Expected Behavior
- ✅ Calls during business hours → Transfer allowed
- ✅ Calls outside business hours → Transfer denied with message
- ✅ Calls on wrong day → Transfer denied with message
- ✅ Invalid function ID → Error returned

---

## Troubleshooting

### Issue: Function returns "Unauthorized"
**Solution**: Verify the Authorization header is set correctly with the Bearer token.

### Issue: Function returns "Config not found"
**Solution**: Verify `project_id` is set to `org_P5F0bnCrRcdlNtZk`.

### Issue: Function returns "Function not found"
**Solution**: Verify `function_id` is either `RETELL_TRANSFER_WEEKDAYS` or `RETELL_TRANSFER_SATURDAY`.

### Issue: Transfer always denied
**Solution**: Check current time and day against the configured business hours.

### Issue: Transfer fails with "Cannot POST /v2/calls/unknown/transfer"
**Error Message**: `{"transfer_allowed":true,"transfer_attempted":true,"message":"Cannot POST /v2/calls/unknown/transfer","error":true}`

**Root Cause**: Retell is sending `"call_id":"unknown"` as a literal string instead of the actual call ID.

**Solution**: 
1. Go to your Retell agent's Custom Function configuration
2. Check the request payload configuration for the `call_id` field
3. Ensure you're using a Retell variable, not the literal string "unknown"
4. Common correct variable formats:
   - `{{call.call_id}}`
   - `{{call_id}}`
   - `{{context.call_id}}`
   - Check Retell's documentation for the exact variable name in your version
5. The payload should look like:
   ```json
   {
     "call_id": "{{call.call_id}}",
     "project_id": "org_P5F0bnCrRcdlNtZk",
     "function_id": "RETELL_TRANSFER_WEEKDAYS"
   }
   ```
6. After updating, test with a new call to verify the call_id is being sent correctly

---

## Support

For technical support or to modify business hours:
1. Access the admin UI: `https://frontend-tindeveloper.vercel.app/projects/org_P5F0bnCrRcdlNtZk`
2. Edit the configuration JSON
3. Save changes

---

## Additional Notes

- The function automatically handles timezone conversions
- Business hours are enforced in Eastern Time (America/New_York)
- The system uses optimistic concurrency to prevent configuration conflicts
- All transfers are logged for audit purposes

---

**Document Version**: 1.0  
**Last Updated**: January 9, 2026  
**System Status**: ✅ Production Ready


