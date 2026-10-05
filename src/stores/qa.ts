import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { QAChecklist, ChecklistItem } from '../types';

interface QAStore {
  checklists: (QAChecklist & { items: ChecklistItem[] })[];
  templates: QAChecklist[];
  loading: boolean;
  error: string | null;
  fetchChecklists: () => Promise<void>;
  createChecklist: (data: Partial<QAChecklist>) => Promise<void>;
  updateChecklist: (id: string, data: Partial<QAChecklist>) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  createItem: (data: Partial<ChecklistItem>) => Promise<void>;
  updateItem: (id: string, data: Partial<ChecklistItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useQAStore = create<QAStore>((set, get) => ({
  checklists: [],
  templates: [],
  loading: false,
  error: null,

  fetchChecklists: async () => {
    try {
      set({ loading: true, error: null });

      const [checklistsResult, templatesResult] = await Promise.all([
        supabase
          .from('qa_checklists')
          .select('*')
          .eq('template', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('qa_checklists')
          .select('*')
          .eq('template', true)
      ]);

      if (checklistsResult.error) throw checklistsResult.error;
      if (templatesResult.error) throw templatesResult.error;

      const checklistsWithItems = await Promise.all(
        (checklistsResult.data || []).map(async (checklist) => {
          const { data: items, error: itemsError } = await supabase
            .from('qa_items')
            .select('*')
            .eq('checklist_id', checklist.id);

          if (itemsError) throw itemsError;

          return {
            ...checklist,
            items: items || [],
          };
        })
      );

      set({
        checklists: checklistsWithItems,
        templates: templatesResult.data || [],
        loading: false
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'An error occurred', loading: false });
    }
  },

  createChecklist: async (data) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('qa_checklists')
        .insert([data]);

      if (error) throw error;

      await get().fetchChecklists();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create checklist', loading: false });
    }
  },

  updateChecklist: async (id, data) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('qa_checklists')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await get().fetchChecklists();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update checklist', loading: false });
    }
  },

  deleteChecklist: async (id) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('qa_checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchChecklists();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete checklist', loading: false });
    }
  },

  createItem: async (data) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('qa_items')
        .insert([data]);

      if (error) throw error;

      await get().fetchChecklists();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create item', loading: false });
    }
  },

  updateItem: async (id, data) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('qa_items')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await get().fetchChecklists();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update item', loading: false });
    }
  },

  deleteItem: async (id) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('qa_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchChecklists();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete item', loading: false });
    }
  },
}));