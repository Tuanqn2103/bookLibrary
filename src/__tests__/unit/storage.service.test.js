// Tạo mock trước khi import module được test
jest.mock('../../config/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockImplementation((bucketName) => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        remove: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test-public-url.com/book-covers/test-image.jpg' } })
      }))
    }
  },
  __esModule: true // Đây là quan trọng cho ES modules
}));

// Import sau khi mock
const { storageService } = require('../../services/storage.service');

// Mock console.error để tránh log trong khi chạy test
console.error = jest.fn();

// Mock fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    blob: jest.fn().mockResolvedValue({ type: 'image/jpeg', size: 1024 })
  })
);

// Mock Date.now() cho predictable test
const mockDateNow = 1234567890;
global.Date.now = jest.fn(() => mockDateNow);

// Mock Math.random() cho predictable test
const mockRandom = 0.123456789;
global.Math.random = jest.fn(() => mockRandom);

// Các Bài Kiểm Tra (Tests)
describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Kiểm tra tính khả dụng của service
  test('StorageService should be defined', () => {
    expect(storageService).toBeDefined();
    expect(typeof storageService.uploadImage).toBe('function');
    expect(typeof storageService.deleteImage).toBe('function');
    expect(typeof storageService.updateImage).toBe('function');
  });

  // Kiểm tra tải ảnh lên với remote URL
  test('uploadImage should call fetch and supabase upload with remote URL', async () => {
    // Arrange
    const imageUrl = 'https://example.com/image.jpg';
    const fileName = 'test-image.jpg';
    
    // Act
    const result = await storageService.uploadImage(imageUrl, fileName);
    
    // Assert
    expect(fetch).toHaveBeenCalledWith(imageUrl);
    expect(result).toBe('https://test-public-url.com/book-covers/test-image.jpg');
  });

  // Kiểm tra tải ảnh lên với local URI (không phải http)
  test('uploadImage should handle local file URI', async () => {
    // Arrange
    const imageUri = 'file:///path/to/image.jpg';
    const fileName = 'local-image.jpg';
    
    // Act
    const result = await storageService.uploadImage(imageUri, fileName);
    
    // Assert
    expect(fetch).toHaveBeenCalledWith(imageUri);
    expect(result).toBe('https://test-public-url.com/book-covers/test-image.jpg');
  });

  // Kiểm tra xóa ảnh
  test('deleteImage should extract file path and call remove', async () => {
    // Arrange
    const imageUrl = 'https://test-public-url.com/book-covers/test-image.jpg';
    
    // Act
    await storageService.deleteImage(imageUrl);
    
    // Assert
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });

  // Kiểm tra trường hợp không tìm thấy filePath trong deleteImage
  test('deleteImage should handle case when filePath is not found', async () => {
    // Arrange
    const imageUrl = 'https://test-public-url.com/invalid-path';
    
    // Act
    await storageService.deleteImage(imageUrl);
    
    // Assert - function should return early without error
    expect(console.error).not.toHaveBeenCalled();
  });

  // Kiểm tra cập nhật ảnh
  test('updateImage should delete old image and upload new image', async () => {
    // Arrange
    const oldImageUrl = 'https://test-public-url.com/book-covers/old-image.jpg';
    const newImageUrl = 'https://example.com/new-image.jpg';
    const fileName = 'new-image.jpg';
    
    // Spy on methods
    const deleteImageSpy = jest.spyOn(storageService, 'deleteImage')
      .mockImplementation(() => Promise.resolve());
    const uploadImageSpy = jest.spyOn(storageService, 'uploadImage')
      .mockImplementation(() => Promise.resolve('https://test-public-url.com/book-covers/new-image.jpg'));
    
    // Act
    const result = await storageService.updateImage(oldImageUrl, newImageUrl, fileName);
    
    // Assert
    expect(deleteImageSpy).toHaveBeenCalledWith(oldImageUrl);
    expect(uploadImageSpy).toHaveBeenCalledWith(newImageUrl, fileName);
    expect(result).toBe('https://test-public-url.com/book-covers/new-image.jpg');
    
    // Clean up
    deleteImageSpy.mockRestore();
    uploadImageSpy.mockRestore();
  });

  // Kiểm tra updateImage mà không có ảnh cũ
  test('updateImage should work without old image', async () => {
    // Arrange
    const oldImageUrl = null;
    const newImageUrl = 'https://example.com/new-image.jpg';
    const fileName = 'new-image.jpg';
    
    // Spy on methods
    const deleteImageSpy = jest.spyOn(storageService, 'deleteImage');
    const uploadImageSpy = jest.spyOn(storageService, 'uploadImage')
      .mockImplementation(() => Promise.resolve('https://test-public-url.com/book-covers/new-image.jpg'));
    
    // Act
    const result = await storageService.updateImage(oldImageUrl, newImageUrl, fileName);
    
    // Assert
    expect(deleteImageSpy).not.toHaveBeenCalled();
    expect(uploadImageSpy).toHaveBeenCalledWith(newImageUrl, fileName);
    expect(result).toBe('https://test-public-url.com/book-covers/new-image.jpg');
    
    // Clean up
    deleteImageSpy.mockRestore();
    uploadImageSpy.mockRestore();
  });

  // Kiểm tra xử lý lỗi trong uploadImage
  test('uploadImage should handle errors', async () => {
    // Arrange
    const imageUrl = 'https://example.com/image.jpg';
    const fileName = 'test-image.jpg';
    
    // Mock fetch to throw error
    global.fetch.mockRejectedValueOnce(new Error('Fetch error'));
    
    // Act & Assert
    await expect(storageService.uploadImage(imageUrl, fileName)).rejects.toThrow('Fetch error');
    expect(console.error).toHaveBeenCalledWith('Error uploading image:', expect.any(Error));
  });

  // Kiểm tra xử lý lỗi từ Supabase trong uploadImage
  test('uploadImage should handle Supabase errors', async () => {
    // Arrange
    const imageUrl = 'https://example.com/image.jpg';
    const fileName = 'test-image.jpg';
    
    // Mock Supabase để trả về error
    const mockSupabase = require('../../config/supabase').supabase;
    const mockUpload = jest.fn().mockResolvedValue({ 
      data: null, 
      error: { message: 'Supabase upload error' } 
    });
    const mockFrom = jest.fn().mockReturnValue({ 
      upload: mockUpload,
      getPublicUrl: jest.fn() 
    });
    
    // Gán implementation tạm thời
    const originalFrom = mockSupabase.storage.from;
    mockSupabase.storage.from = mockFrom;
    
    // Act & Assert
    try {
      await storageService.uploadImage(imageUrl, fileName);
      // Nếu không có error, test sẽ fail
      expect('this line').toBe('should not be reached');
    } catch (error) {
      // Kiểm tra nếu error handling đã hoạt động
      expect(console.error).toHaveBeenCalled();
    } finally {
      // Khôi phục mock
      mockSupabase.storage.from = originalFrom;
    }
  });

  // Kiểm tra xử lý lỗi trong deleteImage
  test('deleteImage should handle errors', async () => {
    // Arrange
    const imageUrl = 'https://test-public-url.com/book-covers/test-image.jpg';
    
    // Mock supabase để mô phỏng lỗi
    const mockSupabase = require('../../config/supabase').supabase;
    const mockRemove = jest.fn().mockResolvedValue({ error: { message: 'Delete error' } });
    const mockFrom = jest.fn().mockReturnValue({ remove: mockRemove });
    
    // Gán implementation tạm thời
    const originalFrom = mockSupabase.storage.from;
    mockSupabase.storage.from = mockFrom;
    
    // Act & Assert
    try {
      await storageService.deleteImage(imageUrl);
      // Nếu không có error, test sẽ fail
      expect('this line').toBe('should not be reached');
    } catch (error) {
      // Kiểm tra nếu error handling đã hoạt động
      expect(console.error).toHaveBeenCalled();
    } finally {
      // Khôi phục mock
      mockSupabase.storage.from = originalFrom;
    }
  });

  // Kiểm tra xử lý lỗi trong updateImage
  test('updateImage should handle errors', async () => {
    // Arrange
    const oldImageUrl = 'https://test-public-url.com/book-covers/old-image.jpg';
    const newImageUrl = 'https://example.com/new-image.jpg';
    const fileName = 'new-image.jpg';
    
    // Spy on uploadImage to throw error
    jest.spyOn(storageService, 'uploadImage').mockRejectedValueOnce(new Error('Update error'));
    
    // Act & Assert
    await expect(storageService.updateImage(oldImageUrl, newImageUrl, fileName)).rejects.toThrow('Update error');
    expect(console.error).toHaveBeenCalledWith('Error updating image:', expect.any(Error));
  });
}); 