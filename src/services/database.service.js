import { supabase } from '../config/supabase';

// User operations
export const userService = {
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userData.id,
        userName: userData.userName,
        email: userData.email,
        role: userData.role || 'user'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteUser(userId) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
  },

  async getUserByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        // Nếu không tìm thấy user, trả về null thay vì throw error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Book operations
export const bookService = {
  async createBook(bookData) {
    const { data, error } = await supabase
      .from('books')
      .insert([bookData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBookById(id) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async updateBook(id, bookData) {
    const { data, error } = await supabase
      .from('books')
      .update(bookData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteBook(id) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Borrowing operations
export const borrowingService = {
  async createBorrowing(borrowingData) {
    const { data, error } = await supabase
      .from('borrowings')
      .insert([borrowingData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBorrowingById(id) {
    const { data, error } = await supabase
      .from('borrowings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserBorrowings(userId) {
    const { data, error } = await supabase
      .from('borrowings')
      .select('*, books(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async updateBorrowing(id, borrowingData) {
    const { data, error } = await supabase
      .from('borrowings')
      .update(borrowingData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

class DatabaseService {
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        // Nếu không tìm thấy user, trả về null thay vì throw error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createUser(userName, email, password, isAdminRegistration = false, authUserId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: authUserId,
            username: userName,
            email,
            role: isAdminRegistration ? 'admin' : 'user'
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = data;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        // Nếu không tìm thấy user, trả về null thay vì throw error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }
}

// Export a single instance of DatabaseService
export const databaseService = new DatabaseService(); 