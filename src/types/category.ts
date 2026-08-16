export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Estudos', color: '#6366F1', icon: '📚', isDefault: true },
  { name: 'Trabalho', color: '#0EA5E9', icon: '💼', isDefault: true },
  { name: 'Pessoal', color: '#10B981', icon: '👤', isDefault: true },
  { name: 'Projetos', color: '#F59E0B', icon: '🚀', isDefault: true },
  { name: 'Faculdade', color: '#EC4899', icon: '🎓', isDefault: true },
  { name: 'Finanças', color: '#8B5CF6', icon: '💰', isDefault: true },
  { name: 'Saúde', color: '#EF4444', icon: '❤️', isDefault: true },
];
