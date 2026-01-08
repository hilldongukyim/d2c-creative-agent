import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fixed Figma file configuration
const FIGMA_CONFIG = {
  fileKey: "2pFBBAAUfwvuw0xLy7nGgJ",
};

interface TextUpdate {
  variableName: string;  // e.g., "Copy_Headline", "Copy_Subcopy", "Copy_CTA"
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
  // Handle CORS preflight requests
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

    const variables = variablesData.meta?.variables || {};
    const collections = variablesData.meta?.variableCollections || {};

    // Find the text variables we need to update
    const variableModeValues: Array<{ variableId: string; modeId: string; value: string }> = [];

    for (const update of textUpdates) {
      // Find variable by name (case-insensitive partial match)
      const matchingVariable = Object.values(variables).find((v: any) => {
        const varName = v.name.toLowerCase();
        const searchName = update.variableName.toLowerCase();
        return varName.includes(searchName) || searchName.includes(varName);
      }) as VariableInfo | undefined;

      if (matchingVariable && matchingVariable.resolvedType === 'STRING') {
        // Get the collection to find the default mode
        const collection = collections[matchingVariable.variableCollectionId] as VariableCollectionInfo;
        
        if (collection) {
          const modeId = collection.defaultModeId;
          
          variableModeValues.push({
            variableId: matchingVariable.id,
            modeId: modeId,
            value: update.value
          });

          console.log(`Matched variable: ${matchingVariable.name} (${matchingVariable.id}) -> "${update.value}"`);
        }
      } else {
        console.log(`Could not find STRING variable for: ${update.variableName}`);
      }
    }

    if (variableModeValues.length === 0) {
      // Return available variables for debugging
      const availableVars = Object.values(variables)
        .filter((v: any) => v.resolvedType === 'STRING')
        .map((v: any) => ({ name: v.name, id: v.id }));
      
      return new Response(JSON.stringify({
        success: false,
        error: 'No matching variables found',
        availableStringVariables: availableVars,
        requestedUpdates: textUpdates.map(u => u.variableName)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Update the variables using POST
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
      
      // Parse error for more details
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Figma update failed: ${errorData.message || errorText}`);
      } catch {
        throw new Error(`Failed to update Figma variables: ${updateResponse.status} - ${errorText}`);
      }
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
