# Retell Custom Function Configuration Guide

## Problem
Retell is sending `"call_id":"unknown"` instead of the actual call ID, causing transfer failures.

## Solution

### 1. JSON Schema (for validation)
Use this schema in Retell's custom function schema/validation section:

```json
{
  "type": "object",
  "required": [
    "call_id",
    "project_id",
    "function_id"
  ],
  "properties": {
    "project_id": {
      "type": "string",
      "const": "org_P5F0bnCrRcdlNtZk",
      "description": "The project organization ID - must be exactly 'org_P5F0bnCrRcdlNtZk'"
    },
    "function_id": {
      "type": "string",
      "enum": ["RETELL_TRANSFER_WEEKDAYS", "RETELL_TRANSFER_SATURDAY"],
      "description": "The function identifier - must be either 'RETELL_TRANSFER_WEEKDAYS' or 'RETELL_TRANSFER_SATURDAY'"
    },
    "call_id": {
      "type": "string",
      "pattern": "^call_[a-zA-Z0-9]+$",
      "description": "The Retell call ID - must be a valid call ID starting with 'call_'. DO NOT use 'unknown' or any placeholder value. Use Retell's call ID variable."
    }
  },
  "additionalProperties": false
}
```

**Key improvements:**
- ✅ Added `pattern` validation to ensure call_id starts with `call_` (rejects "unknown")
- ✅ Added `enum` for function_id to restrict to valid values
- ✅ Added `additionalProperties: false` to prevent extra fields
- ✅ Better descriptions explaining what each field should be

### 2. Request Body Configuration (CRITICAL - This is what you need to fix!)

In Retell's custom function configuration, you need to set the **actual request body** (not just the schema). This is where you specify the values or variables:

#### For Weekday Transfers:
```json
{
  "call_id": "{{call.call_id}}",
  "project_id": "org_P5F0bnCrRcdlNtZk",
  "function_id": "RETELL_TRANSFER_WEEKDAYS"
}
```

#### For Saturday Transfers:
```json
{
  "call_id": "{{call.call_id}}",
  "project_id": "org_P5F0bnCrRcdlNtZk",
  "function_id": "RETELL_TRANSFER_SATURDAY"
}
```

**IMPORTANT:** The `call_id` field MUST use a Retell variable, not a literal string!

### 3. Common Retell Variable Formats

Try these variable formats (check Retell's documentation for your version):

- `{{call.call_id}}` ⭐ (Most common)
- `{{call_id}}`
- `{{context.call_id}}`
- `{{variables.call_id}}`
- `{{call.id}}`
- `${{call.call_id}}` (some versions use $ prefix)

### 4. How to Configure in Retell Dashboard

1. **Go to Retell Dashboard** → Your Agent → Custom Functions
2. **Find your "Out-of-Office Transfer" function**
3. **Look for "Request Body" or "Payload" section** (separate from Schema)
4. **Update the `call_id` field** to use a variable instead of "unknown"
5. **Save the configuration**

### 5. Testing

After updating:
1. Make a test call
2. Check Cloud Run logs to verify the call_id is now a real ID (like `call_abc123...`)
3. The transfer should work correctly

### 6. If Variables Don't Work

If Retell doesn't support variables in the request body, you may need to:
- Check if Retell sends call_id in headers (our code now checks for this)
- Contact Retell support to ask how to access the call_id in custom functions
- Consider using Retell's function calling API instead of webhooks

## Files Created

- `retell-function-schema.json` - Improved JSON schema with validation
- `retell-function-request-body.json` - Example request body with correct variables
- This guide document

Use the schema for validation and the request body example for the actual payload configuration in Retell.
