#!/usr/bin/env node

/**
 * Script to fix Retell agent custom function configuration
 * Updates the call_id to use the correct Retell variable instead of "unknown"
 */

const RETELL_API_KEY = 'key_9173a3b696bb2ce2d50071e5dcdb';
const RETELL_API_BASE = 'https://api.retellai.com';

// Get agent ID from command line argument
const agentId = process.argv[2];

if (!agentId) {
  console.error('Usage: node fix-retell-config.js <agent_id>');
  console.error('Example: node fix-retell-config.js agent_0f5125f801f3502acfe5e2e0f2');
  process.exit(1);
}

async function getAgent(agentId) {
  const endpoints = [
    `/v2/agents/${agentId}`,
    `/v2/get-agent`,
    `/agents/${agentId}`,
    `/v1/agents/${agentId}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${RETELL_API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Found agent using endpoint: ${endpoint}`);
        return { data, endpoint };
      }
    } catch (err) {
      // Try next endpoint
    }
  }

  throw new Error('Could not find agent using any known endpoint');
}

async function updateAgent(agentId, endpoint, agentData) {
  // Try to find and update custom functions
  const updateEndpoints = [
    `/v2/agents/${agentId}`,
    `/v2/update-agent`,
    `/agents/${agentId}`,
    `/v1/agents/${agentId}`,
  ];

  // Common custom function variable formats to try
  const callIdVariables = [
    '{{call.call_id}}',
    '{{call_id}}',
    '{{context.call_id}}',
    '{{variables.call_id}}',
    '{{call.id}}',
  ];

  // Build update payload
  // Note: Structure depends on Retell's API format
  const updatePayload = {
    // Try common field names
    custom_functions: agentData.custom_functions || agentData.webhooks || agentData.functions,
    webhooks: agentData.webhooks || agentData.custom_functions || agentData.functions,
    functions: agentData.functions || agentData.custom_functions || agentData.webhooks,
  };

  // Update call_id in custom functions
  if (updatePayload.custom_functions) {
    updatePayload.custom_functions = updatePayload.custom_functions.map(func => {
      if (func.request_body && typeof func.request_body === 'object') {
        if (func.request_body.call_id === 'unknown' || !func.request_body.call_id) {
          func.request_body.call_id = callIdVariables[0]; // Use most common format
          console.log(`  → Updated call_id to: ${callIdVariables[0]}`);
        }
      }
      return func;
    });
  }

  for (const updateEndpoint of updateEndpoints) {
    try {
      // Try PATCH
      let response = await fetch(`${RETELL_API_BASE}${updateEndpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        console.log(`✅ Updated agent using PATCH ${updateEndpoint}`);
        return await response.json();
      }

      // Try PUT
      response = await fetch(`${RETELL_API_BASE}${updateEndpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        console.log(`✅ Updated agent using PUT ${updateEndpoint}`);
        return await response.json();
      }
    } catch (err) {
      console.log(`  ⚠️  Failed ${updateEndpoint}: ${err.message}`);
    }
  }

  throw new Error('Could not update agent using any known endpoint');
}

async function main() {
  console.log(`🔍 Fetching agent configuration for: ${agentId}`);
  console.log('');

  try {
    // Get current agent configuration
    const { data: agentData, endpoint } = await getAgent(agentId);
    
    console.log('📋 Current agent configuration:');
    console.log(JSON.stringify(agentData, null, 2));
    console.log('');

    // Check if custom functions exist
    const hasCustomFunctions = 
      agentData.custom_functions || 
      agentData.webhooks || 
      agentData.functions ||
      agentData.tools;

    if (!hasCustomFunctions) {
      console.log('⚠️  No custom functions found in agent configuration');
      console.log('   You may need to configure this in the Retell dashboard');
      return;
    }

    console.log('🔧 Attempting to update custom function configuration...');
    console.log('');

    // Try to update
    const updated = await updateAgent(agentId, endpoint, agentData);
    
    console.log('');
    console.log('✅ Successfully updated agent configuration!');
    console.log('');
    console.log('📋 Updated configuration:');
    console.log(JSON.stringify(updated, null, 2));

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('💡 Alternative: Update manually in Retell Dashboard:');
    console.error('   1. Go to Retell Dashboard → Your Agent → Custom Functions');
    console.error('   2. Find the "Out-of-Office Transfer" function');
    console.error('   3. Update the request body call_id to: {{call.call_id}}');
    console.error('   4. Save the configuration');
    process.exit(1);
  }
}

main();
