export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'Work' | 'Study' | 'Personal' | 'Health' | 'Finance' | 'Other';
  dueDate?: string;
  dueTime?: string;
  estimatedTime?: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder?: boolean;
  subtasks?: Subtask[];
  notes?: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}
