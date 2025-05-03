// Tắt các console log và error trong quá trình test
global.console.log = jest.fn();
global.console.error = jest.fn();

// Tạo mock cho module
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
  __esModule: true
}));

// Mock cho fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    blob: jest.fn().mockResolvedValue({ type: 'image/jpeg', size: 1024 })
  })
);

// Import các service sau khi mock
const { storageService } = require('../../services/storage.service');

describe('Tích hợp - Luồng tải lên và quản lý hình ảnh', () => {
  // Giả lập các giá trị test
  const remoteImageUrl = 'https://example.com/test-image.jpg';
  const fileName = 'test-image.jpg';
  let uploadedImageUrl;
  
  // Khôi phục mocks sau mỗi test
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('1. Nên tải lên hình ảnh từ URL từ xa', async () => {
    // Tải lên hình ảnh từ URL
    uploadedImageUrl = await storageService.uploadImage(remoteImageUrl, fileName);
    
    // Kiểm tra kết quả
    expect(uploadedImageUrl).toBe('https://test-public-url.com/book-covers/test-image.jpg');
    expect(fetch).toHaveBeenCalledWith(remoteImageUrl);
  });
  
  test('2. Nên xóa hình ảnh đã tải lên', async () => {
    // Test xóa hình ảnh (sử dụng URL từ bước tải lên)
    const testImageUrl = 'https://test-public-url.com/book-covers/test-image.jpg';
    
    // Thực hiện xóa
    await storageService.deleteImage(testImageUrl);
    
    // Không có lỗi nào xảy ra
    expect(true).toBe(true);
  });
  
  test('3. Nên cập nhật hình ảnh', async () => {
    // Test cập nhật hình ảnh
    const oldImageUrl = 'https://test-public-url.com/book-covers/old-image.jpg';
    const newImageUrl = 'https://example.com/new-image.jpg';
    
    // Spies để theo dõi quá trình
    jest.spyOn(storageService, 'deleteImage').mockResolvedValue();
    jest.spyOn(storageService, 'uploadImage').mockResolvedValue('https://test-public-url.com/book-covers/new-image.jpg');
    
    // Thực hiện cập nhật
    const result = await storageService.updateImage(oldImageUrl, newImageUrl, 'new-image.jpg');
    
    // Kiểm tra
    expect(storageService.deleteImage).toHaveBeenCalledWith(oldImageUrl);
    expect(storageService.uploadImage).toHaveBeenCalledWith(newImageUrl, 'new-image.jpg');
    expect(result).toBe('https://test-public-url.com/book-covers/new-image.jpg');
    
    // Khôi phục các spies
    storageService.deleteImage.mockRestore();
    storageService.uploadImage.mockRestore();
  });
  
  test('4. Nên xử lý các lỗi một cách thích hợp', async () => {
    // Mock một lỗi
    const supabseMock = require('../../config/supabase');
    const mockFrom = supabseMock.supabase.storage.from;
    
    // Override mock để ném lỗi
    mockFrom.mockImplementationOnce(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: new Error('Upload failed') }),
      getPublicUrl: jest.fn()
    }));
    
    // Kiểm tra xử lý lỗi
    await expect(storageService.uploadImage(remoteImageUrl, fileName))
      .rejects.toThrow('Upload failed');
  });
}); 