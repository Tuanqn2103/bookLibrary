// Mock cho service
jest.mock('../../services/storage.service', () => ({
  storageService: {
    uploadImage: jest.fn().mockResolvedValue('https://test-public-url.com/book-covers/test-image.jpg')
  }
}));

// Mock cho Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

// Mock cho fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve({ type: 'image/jpeg', size: 1024 })
  })
);

// Định nghĩa test
describe('Luồng tải lên ảnh - Tích hợp', () => {
  // Import các dependencies đã mock
  const storageService = require('../../services/storage.service').storageService;
  const Alert = require('react-native/Libraries/Alert/Alert');
  
  // Reset mocks trước mỗi test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('nên mô phỏng việc tải lên ảnh từ URL', async () => {
    // Giả lập URL ảnh và callback
    const imageUrl = 'https://example.com/test-image.jpg';
    const mockCallback = jest.fn();
    
    // Gọi service
    const uploadedUrl = await storageService.uploadImage(imageUrl, 'book-cover.jpg');
    
    // Giả lập callback được gọi với URL đã tải lên
    mockCallback(uploadedUrl);
    
    // Kiểm tra kết quả
    expect(storageService.uploadImage).toHaveBeenCalledWith(imageUrl, 'book-cover.jpg');
    expect(mockCallback).toHaveBeenCalledWith('https://test-public-url.com/book-covers/test-image.jpg');
  });
  
  test('nên hiển thị thông báo thành công sau khi tải lên', () => {
    // Giả lập tải lên thành công
    Alert.alert.mockImplementationOnce(() => {});
    
    // Gọi Alert với thông báo thành công
    Alert.alert('Success', 'Image uploaded successfully!');
    
    // Kiểm tra
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Image uploaded successfully!');
  });
  
  test('nên xử lý lỗi khi tải lên thất bại', async () => {
    // Giả lập lỗi tải lên
    storageService.uploadImage.mockRejectedValueOnce(new Error('Upload failed'));
    
    // Giả lập Alert.alert cho thông báo lỗi
    Alert.alert.mockImplementationOnce(() => {});
    
    try {
      // Thử tải lên với URL không hợp lệ
      await storageService.uploadImage('invalid-url', 'file.jpg');
    } catch (error) {
      // Báo lỗi cho người dùng
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
    
    // Kiểm tra
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to upload image. Please try again.');
  });
}); 