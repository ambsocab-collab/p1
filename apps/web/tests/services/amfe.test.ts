import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import {
  getAMFEs,
  getAMFEById,
  createAMFE,
  updateAMFE,
  deleteAMFE,
  getAMFEItems,
  createAMFEItem,
  getCorrectiveActions,
  createCorrectiveAction,
} from '@/services/amfe';
import type { AMFE, AMFEItem, CorrectiveAction } from '@/types/database';

// Mock supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('AMFE Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAMFEs', () => {
    it('should fetch AMFEs successfully', async () => {
      const mockAMFEs: AMFE[] = [
        {
          id: '1',
          name: 'Test AMFE',
          type: 'DFMEA',
          status: 'draft',
          description: 'Test description',
          metadata: {},
          created_by: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockAMFEs,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      const result = await getAMFEs();

      expect(supabase.from).toHaveBeenCalledWith('amfes');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toEqual(mockAMFEs);
    });

    it('should handle errors when fetching AMFEs', async () => {
      const mockError = new Error('Database error');
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      await expect(getAMFEs()).rejects.toThrow(mockError);
    });
  });

  describe('createAMFE', () => {
    it('should create an AMFE successfully', async () => {
      const createData = {
        name: 'New AMFE',
        type: 'DFMEA' as const,
        description: 'New description',
      };

      const mockCreatedAMFE: AMFE = {
        id: '2',
        ...createData,
        status: 'draft',
        metadata: {},
        created_by: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockCreatedAMFE,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await createAMFE(createData);

      expect(supabase.from).toHaveBeenCalledWith('amfes');
      expect(mockInsert).toHaveBeenCalledWith({
        name: createData.name,
        type: createData.type,
        status: 'draft',
        description: createData.description,
        metadata: {},
        created_by: null,
      });
      expect(result).toEqual(mockCreatedAMFE);
    });
  });

  describe('updateAMFE', () => {
    it('should update an AMFE successfully', async () => {
      const updateData = {
        name: 'Updated AMFE',
        status: 'in_progress' as const,
      };

      const mockUpdatedAMFE: AMFE = {
        id: '1',
        name: 'Updated AMFE',
        type: 'DFMEA',
        status: 'in_progress',
        description: 'Test description',
        metadata: {},
        created_by: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUpdatedAMFE,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await updateAMFE('1', updateData);

      expect(supabase.from).toHaveBeenCalledWith('amfes');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateData,
          updated_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockUpdatedAMFE);
    });
  });

  describe('deleteAMFE', () => {
    it('should delete an AMFE successfully', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      await deleteAMFE('1');

      expect(supabase.from).toHaveBeenCalledWith('amfes');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('should throw error when delete fails', async () => {
      const mockError = new Error('Delete failed');
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        error: mockError,
      });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      await expect(deleteAMFE('1')).rejects.toThrow(mockError);
    });
  });
});

describe('AMFE Items Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAMFEItems', () => {
    it('should fetch AMFE items for a specific AMFE', async () => {
      const mockItems: AMFEItem[] = [
        {
          id: 'item1',
          amfe_id: '1',
          failure_mode_id: null,
          process_step: 'Step 1',
          function: 'Test function',
          failure_mode: 'Test failure',
          failure_effects: 'Test effects',
          severity: 5,
          occurrence: 3,
          detection: 2,
          npr: 30,
          risk_level: 'Low',
          current_controls: 'Test controls',
          recommendations: 'Test recommendations',
          metadata: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockItems,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      const result = await getAMFEItems('1');

      expect(supabase.from).toHaveBeenCalledWith('amfe_items');
      expect(mockEq).toHaveBeenCalledWith('amfe_id', '1');
      expect(result).toEqual(mockItems);
    });
  });

  describe('createAMFEItem', () => {
    it('should create an AMFE item successfully', async () => {
      const itemData = {
        amfe_id: '1',
        failure_mode: 'Test failure',
        severity: 5,
        occurrence: 3,
        detection: 2,
      };

      const mockCreatedItem: AMFEItem = {
        id: 'item1',
        ...itemData,
        failure_mode_id: null,
        process_step: null,
        function: null,
        failure_effects: null,
        npr: 30,
        risk_level: 'Low',
        current_controls: null,
        recommendations: null,
        metadata: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockCreatedItem,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await createAMFEItem(itemData);

      expect(supabase.from).toHaveBeenCalledWith('amfe_items');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          ...itemData,
          failure_mode_id: null,
          process_step: null,
          function: null,
          failure_effects: null,
          current_controls: null,
          recommendations: null,
          metadata: {},
        })
      );
      expect(result).toEqual(mockCreatedItem);
    });
  });
});

describe('Corrective Actions Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCorrectiveActions', () => {
    it('should fetch corrective actions for an AMFE item', async () => {
      const mockActions: CorrectiveAction[] = [
        {
          id: 'action1',
          amfe_item_id: 'item1',
          action_text: 'Test action',
          responsible_party: 'John Doe',
          due_date: '2024-12-31',
          status: 'pending',
          estimated_cost: 1000.0,
          actual_cost: null,
          effectiveness: null,
          notes: 'Test notes',
          metadata: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockActions,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      const result = await getCorrectiveActions('item1');

      expect(supabase.from).toHaveBeenCalledWith('corrective_actions');
      expect(mockEq).toHaveBeenCalledWith('amfe_item_id', 'item1');
      expect(result).toEqual(mockActions);
    });
  });

  describe('createCorrectiveAction', () => {
    it('should create a corrective action successfully', async () => {
      const actionData = {
        amfe_item_id: 'item1',
        action_text: 'Test action',
        responsible_party: 'John Doe',
        estimated_cost: 1000.0,
      };

      const mockCreatedAction: CorrectiveAction = {
        id: 'action1',
        ...actionData,
        due_date: null,
        status: 'pending',
        actual_cost: null,
        effectiveness: null,
        notes: null,
        metadata: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockCreatedAction,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await createCorrectiveAction(actionData);

      expect(supabase.from).toHaveBeenCalledWith('corrective_actions');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          ...actionData,
          due_date: null,
          status: 'pending',
          actual_cost: null,
          effectiveness: null,
          notes: null,
          metadata: {},
        })
      );
      expect(result).toEqual(mockCreatedAction);
    });
  });
});