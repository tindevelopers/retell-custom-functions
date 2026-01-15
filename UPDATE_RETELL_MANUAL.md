# Manual Update Instructions for Retell Agent Configuration

Since the Retell API endpoints for updating agent configurations are not publicly accessible or require different authentication, here are the **manual steps** to fix the `call_id` issue:

## Agent ID
`agent_0f5125f801f3502acfe5e2e0f2`

## Steps to Fix

### 1. Access Retell Dashboard
1. Go to [Retell Dashboard](https://dashboard.retellai.com/)
2. Log in with your credentials
3. Navigate to **Agents** → Find agent `agent_0f5125f801f3502acfe5e2e0f2`

### 2. Open Custom Functions
1. Click on the agent to open its settings
2. Go to **Custom Functions** or **Tools** or **Webhooks** section
3. Find the function named "Out-of-Office Transfer" or similar

### 3. Update Request Body Configuration

**Current (WRONG) Configuration:**
```json
{
  "call_id": "unknown",
  "project_id": "org_P5F0bnCrRcdlNtZk",
  "function_id": "RETELL_TRANSFER_WEEKDAYS"
}
```

**Updated (CORRECT) Configuration:**
```json
{
  "call_id": "{{call.call_id}}",
  "project_id": "org_P5F0bnCrRcdlNtZk",
  "function_id": "RETELL_TRANSFER_WEEKDAYS"
}
```

### 4. Alternative Variable Formats to Try

If `{{call.call_id}}` doesn't work, try these in order:

1. `{{call.call_id}}` ⭐ (Most common)
2. `{{call_id}}`
3. `{{context.call_id}}`
4. `{{variables.call_id}}`
5. `{{call.id}}`
6. `${{call.call_id}}` (with $ prefix)

### 5. Update JSON Schema (if shown separately)

If Retell shows a separate schema section, use this:

```json
{
  "type": "object",
  "required": ["call_id", "project_id", "function_id"],
  "properties": {
    "project_id": {
      "type": "string",
      "const": "org_P5F0bnCrRcdlNtZk",
      "description": "The project organization ID"
    },
    "function_id": {
      "type": "string",
      "enum": ["RETELL_TRANSFER_WEEKDAYS", "RETELL_TRANSFER_SATURDAY"],
      "description": "The function identifier"
    },
    "call_id": {
      "type": "string",
      "pattern": "^call_[a-zA-Z0-9]+$",
      "description": "The Retell call ID - must be a valid call ID starting with 'call_'"
    }
  },
  "additionalProperties": false
}
```

### 6. Save and Test

1. **Save** the configuration
2. Make a **test call** to verify
3. Check **Cloud Run logs** to confirm the call_id is now a real ID (not "unknown")

### 7. Verify in Logs

After making a test call, check the logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=out-of-office-transfer" --limit=10 --format="table(timestamp,textPayload)" --project=pet-store-direct
```

Look for log entries showing:
- ✅ `"call_id":"call_abc123..."` (real call ID)
- ❌ NOT `"call_id":"unknown"`

## What Changed

The key change is in the **request body** configuration:
- **Before**: `"call_id": "unknown"` (literal string - WRONG)
- **After**: `"call_id": "{{call.call_id}}"` (Retell variable - CORRECT)

This tells Retell to substitute the actual call ID at runtime instead of sending the literal string "unknown".

## Need Help?

If you can't find the custom function configuration:
1. Check if it's under a different name (Tools, Webhooks, Functions)
2. Look for the webhook URL: `https://out-of-office-transfer-880489367524.us-central1.run.app/retell/transfer`
3. Contact Retell support with agent ID: `agent_0f5125f801f3502acfe5e2e0f2`
