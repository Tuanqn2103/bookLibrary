export interface User {
  id: string;
  userName: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  published_year: number | null;
  total_copies: number;
  available_copies: number;
  created_at: string;
}

export interface Borrowing {
  id: number;
  user_id: string;
  book_id: number;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned' | 'overdue';
} 