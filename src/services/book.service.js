import { supabase } from '../config/supabase';

class BookService {
  async getAllBooks() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          id,
          title,
          description,
          isbn,
          published_date,
          cover_image,
          total_copies,
          available_copies,
          status,
          author_id,
          category_id,
          authors (
            id,
            authorname
          ),
          categories (
            id,
            categoryname
          )
        `);

      if (error) throw error;
      
      // Transform data to match our needs
      return data.map(book => ({
        id: book.id,
        title: book.title,
        description: book.description,
        isbn: book.isbn,
        published_date: book.published_date,
        cover_image: book.cover_image,
        total_copies: book.total_copies,
        available_copies: book.available_copies,
        status: book.status,
        author: book.authors?.authorname || 'Unknown Author',
        author_id: book.author_id,
        category: book.categories?.categoryname || 'Uncategorized',
        category_id: book.category_id
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  async getBookById(id) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          id,
          title,
          description,
          isbn,
          published_date,
          cover_image,
          total_copies,
          available_copies,
          status,
          author_id,
          category_id,
          authors (
            id,
            authorname
          ),
          categories (
            id,
            categoryname
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) return null;

      // Transform data to match our needs
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        isbn: data.isbn,
        published_date: data.published_date,
        cover_image: data.cover_image,
        total_copies: data.total_copies,
        available_copies: data.available_copies,
        status: data.status,
        author: data.authors?.authorname || 'Unknown Author',
        author_id: data.author_id,
        category: data.categories?.categoryname || 'Uncategorized',
        category_id: data.category_id
      };
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  }

  async addBook(bookData) {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([bookData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  }

  async updateBook(id, bookData) {
    try {
      const { data, error } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }

  async deleteBook(id) {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }

  async searchBooks(query) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          authors (
            id,
            authorname
          ),
          categories (
            id,
            categoryname
          )
        `)
        .or(`title.ilike.%${query}%,authors.authorname.ilike.%${query}%`);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      console.log('Fetching categories from Supabase...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('categoryname');

      if (error) {
        console.error('Supabase error fetching categories:', error);
        throw error;
      }

      console.log('Categories fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw error;
    }
  }

  async addCategory(categoryName) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ categoryname: categoryName }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  async updateCategory(id, categoryName) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ categoryname: categoryName })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async getAllAuthors() {
    try {
      console.log('Fetching authors from Supabase...');
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('authorname');

      if (error) {
        console.error('Supabase error fetching authors:', error);
        throw error;
      }

      console.log('Authors fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in getAllAuthors:', error);
      throw error;
    }
  }

  async addAuthor(authorName) {
    try {
      const { data, error } = await supabase
        .from('authors')
        .insert([{ authorname: authorName }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding author:', error);
      throw error;
    }
  }

  async updateAuthor(id, authorName) {
    try {
      const { data, error } = await supabase
        .from('authors')
        .update({ authorname: authorName })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating author:', error);
      throw error;
    }
  }

  async deleteAuthor(id) {
    try {
      const { error } = await supabase
        .from('authors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting author:', error);
      throw error;
    }
  }
}

export const bookService = new BookService(); 