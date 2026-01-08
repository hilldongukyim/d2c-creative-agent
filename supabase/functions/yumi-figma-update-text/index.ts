import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fixed Figma file configuration
const FIGMA_CONFIG = {
  fileKey: "2pFBBAAUfwvuw0xLy7nGgJ",
};

// Variable names we expect to exist/create
const EXPECTED_VARIABLES = [
  { name: "headline", displayName: "Copy_Headline" },
  { name: "subcopy", displayName: "Copy_Subcopy" },
  { name: "cta", displayName: "Copy_CTA" },
];

interface TextUpdate {
  variableName: string;
  value: string;
}

interface VariableInfo {
  id: string;
  name: string;
  resolvedType: string;
  variableCollectionId: string;
  valuesByMode: Record<string, any>;
}

interface VariableCollectionInfo {
  id: string;
  name: string;
  defaultModeId: string;
  modes: Array<{ modeId: string; name: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIGMA_ACCESS_TOKEN = Deno.env.get('FIGMA_ACCESS_TOKEN');
    
    if (!FIGMA_ACCESS_TOKEN) {
      throw new Error('FIGMA_ACCESS_TOKEN is not configured');
    }

    const { textUpdates } = await req.json() as { textUpdates: TextUpdate[] };

    if (!textUpdates || textUpdates.length === 0) {
      throw new Error('No text updates provided');
    }

    console.log(`Updating ${textUpdates.length} text variables`);

    // Step 1: Get current local variables from Figma
    const variablesResponse = await fetch(
      `https://api.figma.com/v1/files/${FIGMA_CONFIG.fileKey}/variables/local`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
        },
      }
    );

    if (!variablesResponse.ok) {
      const errorText = await variablesResponse.text();
      console.error('Failed to fetch variables:', variablesResponse.status, errorText);
      
      if (variablesResponse.status === 403) {
        throw new Error('Figma API access denied. Enterprise plan required for Variables API.');
      }
      throw new Error(`Failed to fetch Figma variables: ${variablesResponse.status}`);
    }

    const variablesData = await variablesResponse.json();
    console.log('Variables data received');

    let variables = variablesData.meta?.variables || {};
    let collections = variablesData.meta?.variableCollections || {};

    // Find or create "Copy" collection
    let copyCollectionId: string | null = null;
    let copyCollectionModeId: string | null = null;

    // Look for existing "Copy" or "Text" collection
    for (const [id, collection] of Object.entries(collections)) {
      const col = collection as VariableCollectionInfo;
      if (col.name.toLowerCase().includes('copy') || col.name.toLowerCase().includes('text')) {
        copyCollectionId = id;
        copyCollectionModeId = col.defaultModeId;
        console.log(`Found existing collection: ${col.name} (${id})`);
        break;
      }
    }

    // If no collection exists, we need to create one
    const variablesToCreate: Array<{ name: string; searchName: string }> = [];
    const existingVariables: Map<string, VariableInfo> = new Map();

    // Check which variables already exist
    for (const expected of EXPECTED_VARIABLES) {
      let found = false;
      for (const [id, variable] of Object.entries(variables)) {
        const v = variable as VariableInfo;
        const varNameLower = v.name.toLowerCase();
        if (v.resolvedType === 'STRING' && 
            (varNameLower.includes(expected.name.toLowerCase()) || 
             varNameLower.includes(expected.displayName.toLowerCase()))) {
          existingVariables.set(expected.name, v);
          found = true;
          console.log(`Found existing variable: ${v.name} for ${expected.name}`);
          break;
        }
      }
      if (!found) {
        variablesToCreate.push({ name: expected.displayName, searchName: expected.name });
      }
    }

    // Create missing variables and collection if needed
    if (variablesToCreate.length > 0) {
      console.log(`Creating ${variablesToCreate.length} missing variables`);

      const createPayload: any = {
        variableModeValues: []
      };

      // If no collection exists, create one
      if (!copyCollectionId) {
        console.log('Creating new Copy collection');
        createPayload.variableCollections = [{
          action: "CREATE",
          id: "temp_collection_id",
          name: "Copy",
          initialModeId: "temp_mode_id"
        }];
        copyCollectionId = "temp_collection_id";
        copyCollectionModeId = "temp_mode_id";
      }

      // Create the missing variables
      createPayload.variables = variablesToCreate.map((v, index) => ({
        action: "CREATE",
        id: `temp_var_${index}`,
        name: v.name,
        resolvedType: "STRING",
        variableCollectionId: copyCollectionId
      }));

      // Set initial values for new variables
      const updateToValueMap: Map<string, string> = new Map();
      for (const update of textUpdates) {
        updateToValueMap.set(update.variableName.toLowerCase(), update.value);
      }

      createPayload.variableModeValues = variablesToCreate.map((v, index) => ({
        variableId: `temp_var_${index}`,
        modeId: copyCollectionModeId,
        value: updateToValueMap.get(v.searchName.toLowerCase()) || ""
      }));

      console.log('Create payload:', JSON.stringify(createPayload, null, 2));

      const createResponse = await fetch(
        `https://api.figma.com/v1/files/${FIGMA_CONFIG.fileKey}/variables`,
        {
          method: 'POST',
          headers: {
            'X-Figma-Token': FIGMA_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createPayload),
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Failed to create variables:', createResponse.status, errorText);
        throw new Error(`Failed to create Figma variables: ${createResponse.status} - ${errorText}`);
      }

      const createResult = await createResponse.json();
      console.log('Variables created successfully:', JSON.stringify(createResult, null, 2));

      // Map temp IDs to real IDs
      const tempIdToRealId = createResult.tempIdToRealId || {};
      
      // Update our tracking with new real IDs
      for (let i = 0; i < variablesToCreate.length; i++) {
        const tempId = `temp_var_${i}`;
        const realId = tempIdToRealId[tempId];
        if (realId) {
          existingVariables.set(variablesToCreate[i].searchName, {
            id: realId,
            name: variablesToCreate[i].name,
            resolvedType: 'STRING',
            variableCollectionId: tempIdToRealId[copyCollectionId] || copyCollectionId,
            valuesByMode: {}
          });
        }
      }

      // Update collection and mode IDs if they were created
      if (tempIdToRealId['temp_collection_id']) {
        copyCollectionId = tempIdToRealId['temp_collection_id'];
      }
      if (tempIdToRealId['temp_mode_id']) {
        copyCollectionModeId = tempIdToRealId['temp_mode_id'];
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Variables created and values set',
        createdCount: variablesToCreate.length,
        tempIdToRealId: createResult.meta?.tempIdToRealId || tempIdToRealId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Update existing variables
    const variableModeValues: Array<{ variableId: string; modeId: string; value: string }> = [];

    for (const update of textUpdates) {
      const varInfo = existingVariables.get(update.variableName.toLowerCase());
      if (varInfo) {
        // Get the collection to find the mode
        const collection = collections[varInfo.variableCollectionId] as VariableCollectionInfo;
        const modeId = collection?.defaultModeId;
        
        if (modeId) {
          variableModeValues.push({
            variableId: varInfo.id,
            modeId: modeId,
            value: update.value
          });
          console.log(`Will update: ${varInfo.name} -> "${update.value}"`);
        }
      }
    }

    if (variableModeValues.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No variables to update after creation attempt',
        existingVariables: Array.from(existingVariables.entries()).map(([k, v]) => ({ key: k, name: v.name, id: v.id }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update the variables
    console.log('Updating variables:', JSON.stringify(variableModeValues, null, 2));

    const updateResponse = await fetch(
      `https://api.figma.com/v1/files/${FIGMA_CONFIG.fileKey}/variables`,
      {
        method: 'POST',
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variableModeValues: variableModeValues
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update variables:', updateResponse.status, errorText);
      throw new Error(`Failed to update Figma variables: ${updateResponse.status} - ${errorText}`);
    }

    const updateResult = await updateResponse.json();
    console.log('Variables updated successfully:', updateResult);

    return new Response(JSON.stringify({
      success: true,
      updatedCount: variableModeValues.length,
      updates: variableModeValues.map(v => ({
        variableId: v.variableId,
        newValue: v.value
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in yumi-figma-update-text:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
