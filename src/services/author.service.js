import { supabase } from '../config/supabase';

class AuthorService {
  async getAllAuthors() {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('authorname', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching authors:', error);
      throw error;
    }
  }

  async getAuthorById(id) {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching author:', error);
      throw error;
    }
  }

  async addAuthor(authorData) {
    try {
      const { data, error } = await supabase
        .from('authors')
        .insert([authorData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding author:', error);
      throw error;
    }
  }

  async updateAuthor(id, authorData) {
    try {
      const { data, error } = await supabase
        .from('authors')
        .update(authorData)
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

  async searchAuthors(query) {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .ilike('authorname', `%${query}%`)
        .order('authorname', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching authors:', error);
      throw error;
    }
  }
}

export const authorService = new AuthorService(); 