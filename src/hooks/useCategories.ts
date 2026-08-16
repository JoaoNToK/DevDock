'use client';

import { useState, useEffect, useCallback } from 'react';
import { Category, DEFAULT_CATEGORIES } from '@/types/category';
import { storageAdapter } from '@/lib/storage';

const STORAGE_KEY = 'devdock:categories_v1';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize and seed default categories if missing
  const loadCategories = useCallback(() => {
    try {
      const stored = storageAdapter.get<Category[]>(STORAGE_KEY, []);
      if (!stored || stored.length === 0) {
        const now = new Date().toISOString();
        const initial: Category[] = DEFAULT_CATEGORIES.map((cat, idx) => ({
          id: `cat-default-${idx + 1}`,
          ...cat,
          createdAt: now,
          updatedAt: now,
        }));
        storageAdapter.set(STORAGE_KEY, initial);
        setCategories(initial);
      } else {
        setCategories(stored);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadCategories();
  }, [loadCategories]);

  // Synchronize across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadCategories();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadCategories]);

  const addCategory = useCallback(
    (name: string, color: string, icon?: string) => {
      const now = new Date().toISOString();
      const newCat: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        color: color || '#6366F1',
        icon: icon || '📁',
        isDefault: false,
        createdAt: now,
        updatedAt: now,
      };

      setCategories((prev) => {
        const updated = [...prev, newCat];
        storageAdapter.set(STORAGE_KEY, updated);
        return updated;
      });

      return newCat;
    },
    []
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Pick<Category, 'name' | 'color' | 'icon'>>) => {
      const now = new Date().toISOString();
      setCategories((prev) => {
        const updated = prev.map((cat) =>
          cat.id === id ? { ...cat, ...updates, updatedAt: now } : cat
        );
        storageAdapter.set(STORAGE_KEY, updated);
        return updated;
      });
    },
    []
  );

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const updated = prev.filter((cat) => cat.id !== id);
      storageAdapter.set(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  return {
    isMounted,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories,
  };
}
