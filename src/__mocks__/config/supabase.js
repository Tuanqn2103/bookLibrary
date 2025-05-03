// Tạo mock cho Supabase
const mockStorage = {
  from: jest.fn().mockReturnValue({
    upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
    remove: jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ 
      data: { publicUrl: 'https://test-public-url.com/book-covers/test-image.jpg' } 
    })
  })
};

// Export mock
module.exports = {
  supabase: {
    storage: mockStorage
  },
  supabaseUrl: 'https://test-supabase-url.com'
}; 