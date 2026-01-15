# Custom Function Trigger Guide

## Answer: No, Not Every Call Automatically Triggers the Function

**Custom functions in Retell are NOT automatically triggered on every call.** They need to be explicitly configured to trigger at specific points in the conversation.

## How Retell Custom Functions Work

### Two Main Configuration Approaches:

#### 1. **Function Calling (LLM Decides When)**
- The function is available to the LLM as a "tool"
- The LLM decides **when** to call it based on the conversation
- Example: User asks to speak to someone → LLM calls the transfer function

#### 2. **Conversation Flow Node (Always Triggers)**
- The function is a node in the conversation flow
- It **always** triggers when the conversation reaches that node
- Example: After greeting → Check transfer availability → Decide next step

## Recommended Approach for Out-of-Office Transfer

For your use case (determining if calls should transfer or go to voicemail), you have **two options**:

### Option A: Always Check at Call Start (Recommended)

**Configuration:**
- Add the custom function as the **first step** in your conversation flow
- Or trigger it immediately when the call starts
- The function checks business hours and returns:
  - `transfer_allowed: true` → Transfer the call
  - `transfer_allowed: false` → Continue with agent (or go to voicemail)

**Pros:**
- ✅ Every call is checked
- ✅ Consistent behavior
- ✅ No missed transfers

**Cons:**
- ⚠️ Extra API call for every call
- ⚠️ Slight latency

### Option B: On-Demand (LLM Decides)

**Configuration:**
- Make the function available as a "tool" the LLM can call
- LLM calls it when user requests to speak to someone
- Example: User says "Can I speak to a person?" → LLM calls function

**Pros:**
- ✅ Only called when needed
- ✅ More efficient

**Cons:**
- ⚠️ LLM might not call it in all scenarios
- ⚠️ Inconsistent behavior

## Current Implementation Analysis

Looking at your code, the function:
1. ✅ Checks business hours
2. ✅ Returns `transfer_allowed: true/false`
3. ✅ Provides a deny message if transfer not allowed
4. ✅ Actually performs the transfer if allowed

**This suggests it should be called early in the call flow** to make the decision.

## Recommended Configuration

### For Single/Multi-Prompt Agents:

1. **Add to your prompt:**
   ```
   When a call comes in, first check if transfers are available by calling the 
   "check_transfer_availability" function. Based on the response:
   - If transfer_allowed is true: Transfer the call immediately
   - If transfer_allowed is false: Continue the conversation and inform the caller 
     that the team is unavailable. Offer to create a support ticket.
   ```

2. **Or use as a function call:**
   - Make it available as a tool
   - LLM will call it when appropriate

### For Conversation Flow Agents:

1. **Add as first node:**
   - Create a "Function Node" at the start
   - Configure it to call your custom function
   - Based on response:
     - `transfer_allowed: true` → Go to "Transfer Call" node
     - `transfer_allowed: false` → Go to "Continue Conversation" node

2. **Or add as conditional:**
   - After greeting
   - Check transfer availability
   - Route based on result

## Implementation Example

### Conversation Flow Structure:

```
Call Starts
    ↓
[Function Node: Check Transfer Availability]
    ↓
    ├─→ transfer_allowed: true → [Transfer Call Node]
    │
    └─→ transfer_allowed: false → [Continue Conversation]
                                      ↓
                                  [Offer Support Ticket]
```

## When Should It Trigger?

### Recommended: **At Call Start**

**Reasoning:**
- You want to know immediately if transfers are available
- Better user experience (no waiting)
- Consistent behavior across all calls
- Prevents confusion if user asks to transfer later

### Alternative: **When User Requests Transfer**

**Reasoning:**
- More efficient (only called when needed)
- But requires LLM to recognize transfer requests
- May miss some scenarios

## Testing the Trigger

To verify the function is being called:

1. **Check Cloud Run logs:**
   ```bash
   ./test-function.sh
   ```

2. **Look for:**
   - Requests coming in for every call (if configured to always trigger)
   - Or requests only when transfer is requested (if on-demand)

3. **Verify timing:**
   - Should see requests early in the call (within first few seconds)
   - Not just at the end

## Current Behavior Check

Run this to see how often your function is being called:

```bash
export PATH="/Users/developer/google-cloud-sdk/bin:$PATH"
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=out-of-office-transfer" \
  --limit=50 \
  --format="table(timestamp,textPayload)" \
  --project=pet-store-direct | grep "Retell transfer request received"
```

**If you see:**
- ✅ Requests for every call → Function is configured to always trigger
- ⚠️ Few or no requests → Function is only called on-demand (may need to configure it to always trigger)

## Recommendation

**For your use case (out-of-office transfer), configure it to trigger at call start:**

1. This ensures every call is checked
2. Consistent behavior
3. Better user experience
4. Prevents missed transfers

The slight overhead of an extra API call is worth the reliability and consistency.
