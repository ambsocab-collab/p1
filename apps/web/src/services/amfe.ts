import { supabase } from '../lib/supabase';
import type {
  AMFE,
  CreateAMFEData,
  AMFEItem,
  CreateAMFEItemData,
  CorrectiveAction,
  CreateCorrectiveActionData,
  Evidence,
  CreateEvidenceData
} from '../types/database';

// AMFE CRUD operations
export const getAMFEs = async (): Promise<AMFE[]> => {
  const { data, error } = await supabase
    .from('amfes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching AMFEs:', error);
    throw error;
  }

  return data || [];
};

export const getAMFEById = async (id: string): Promise<AMFE | null> => {
  const { data, error } = await supabase
    .from('amfes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching AMFE:', error);
    throw error;
  }

  return data;
};

export const createAMFE = async (amfeData: CreateAMFEData): Promise<AMFE> => {
  const insertData = {
    name: amfeData.name,
    type: amfeData.type,
    status: 'draft',
    description: amfeData.description || null,
    metadata: amfeData.metadata || {},
    created_by: null, // Will be set by trigger for authenticated users
  };

  const { data, error } = await supabase
    .from('amfes')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating AMFE:', error);
    throw error;
  }

  return data;
};

export const updateAMFE = async (id: string, updates: Partial<CreateAMFEData>): Promise<AMFE> => {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('amfes')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating AMFE:', error);
    throw error;
  }

  return data;
};

export const deleteAMFE = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('amfes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting AMFE:', error);
    throw error;
  }
};

// AMFE Items CRUD operations
export const getAMFEItems = async (amfeId: string): Promise<AMFEItem[]> => {
  const { data, error } = await supabase
    .from('amfe_items')
    .select('*')
    .eq('amfe_id', amfeId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching AMFE items:', error);
    throw error;
  }

  return data || [];
};

export const createAMFEItem = async (itemData: CreateAMFEItemData): Promise<AMFEItem> => {
  const insertData = {
    amfe_id: itemData.amfe_id,
    failure_mode_id: itemData.failure_mode_id || null,
    process_step: itemData.process_step || null,
    function: itemData.function || null,
    failure_mode: itemData.failure_mode,
    failure_effects: itemData.failure_effects || null,
    severity: itemData.severity,
    occurrence: itemData.occurrence,
    detection: itemData.detection,
    current_controls: itemData.current_controls || null,
    recommendations: itemData.recommendations || null,
    metadata: itemData.metadata || {},
  };

  const { data, error } = await supabase
    .from('amfe_items')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating AMFE item:', error);
    throw error;
  }

  return data;
};

export const updateAMFEItem = async (id: string, updates: Partial<CreateAMFEItemData>): Promise<AMFEItem> => {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('amfe_items')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating AMFE item:', error);
    throw error;
  }

  return data;
};

export const deleteAMFEItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('amfe_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting AMFE item:', error);
    throw error;
  }
};

// Corrective Actions CRUD operations
export const getCorrectiveActions = async (amfeItemId: string): Promise<CorrectiveAction[]> => {
  const { data, error } = await supabase
    .from('corrective_actions')
    .select('*')
    .eq('amfe_item_id', amfeItemId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching corrective actions:', error);
    throw error;
  }

  return data || [];
};

export const createCorrectiveAction = async (actionData: CreateCorrectiveActionData): Promise<CorrectiveAction> => {
  const insertData = {
    amfe_item_id: actionData.amfe_item_id,
    action_text: actionData.action_text,
    responsible_party: actionData.responsible_party || null,
    due_date: actionData.due_date || null,
    status: 'pending',
    estimated_cost: actionData.estimated_cost || null,
    actual_cost: null,
    effectiveness: null,
    notes: actionData.notes || null,
    metadata: actionData.metadata || {},
  };

  const { data, error } = await supabase
    .from('corrective_actions')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating corrective action:', error);
    throw error;
  }

  return data;
};

export const updateCorrectiveAction = async (id: string, updates: Partial<CreateCorrectiveActionData>): Promise<CorrectiveAction> => {
  const { data, error } = await supabase
    .from('corrective_actions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating corrective action:', error);
    throw error;
  }

  return data;
};

export const deleteCorrectiveAction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('corrective_actions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting corrective action:', error);
    throw error;
  }
};

// Evidence CRUD operations
export const getEvidence = async (correctiveActionId: string): Promise<Evidence[]> => {
  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .eq('corrective_action_id', correctiveActionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching evidence:', error);
    throw error;
  }

  return data || [];
};

export const createEvidence = async (evidenceData: CreateEvidenceData): Promise<Evidence> => {
  const insertData = {
    corrective_action_id: evidenceData.corrective_action_id || null,
    file_name: evidenceData.file_name,
    file_path: evidenceData.file_path,
    file_type: evidenceData.file_type || null,
    file_size: evidenceData.file_size || null,
    uploaded_by: null, // Will be set by trigger for authenticated users
    description: evidenceData.description || null,
    metadata: evidenceData.metadata || {},
  };

  const { data, error } = await supabase
    .from('evidence')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating evidence:', error);
    throw error;
  }

  return data;
};

export const deleteEvidence = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('evidence')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting evidence:', error);
    throw error;
  }
};

// Utility function to get complete AMFE with all related data
export const getCompleteAMFE = async (id: string): Promise<{
  amfe: AMFE;
  items: (AMFEItem & {
    corrective_actions: (CorrectiveAction & {
      evidence: Evidence[];
    })[];
  })[];
} | null> => {
  const amfe = await getAMFEById(id);
  if (!amfe) return null;

  const items = await getAMFEItems(id);
  const itemsWithActions = await Promise.all(
    items.map(async (item) => {
      const actions = await getCorrectiveActions(item.id);
      const actionsWithEvidence = await Promise.all(
        actions.map(async (action) => {
          const evidence = await getEvidence(action.id);
          return { ...action, evidence };
        })
      );
      return { ...item, corrective_actions: actionsWithEvidence };
    })
  );

  return {
    amfe,
    items: itemsWithActions,
  };
};