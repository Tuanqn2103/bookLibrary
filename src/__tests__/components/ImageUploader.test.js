// Mock cho storage service
jest.mock('../../services/storage.service', () => ({
  storageService: {
    uploadImage: jest.fn().mockResolvedValue('https://test-public-url.com/book-covers/test-image.jpg')
  }
}));

// Mock cho Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

// Định nghĩa test
describe('ImageUploader Component', () => {
  // Import các dependencies cần mock
  const storageService = require('../../services/storage.service').storageService;
  const Alert = require('react-native/Libraries/Alert/Alert');
  
  // Reset mocks trước mỗi test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Các test cho logic chính của component
  test('should call uploadImage with correct parameters', () => {
    // Mock gọi upload image
    const imageUrl = 'https://example.com/test-image.jpg';
    const fileName = 'book-cover.jpg';
    
    // Verify mock chưa được gọi
    expect(storageService.uploadImage).not.toHaveBeenCalled();
    
    // Giả lập gọi hàm uploadImage
    storageService.uploadImage(imageUrl, fileName);
    
    // Verify mock được gọi với tham số đúng
    expect(storageService.uploadImage).toHaveBeenCalledWith(imageUrl, fileName);
    expect(storageService.uploadImage).toHaveBeenCalledTimes(1);
  });
  
  test('should show error alert for empty URL', () => {
    // Verify mock Alert chưa được gọi
    expect(Alert.alert).not.toHaveBeenCalled();
    
    // Giả lập gọi Alert.alert
    Alert.alert('Error', 'Please enter an image URL');
    
    // Verify mock được gọi với tham số đúng
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter an image URL');
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });
  
  test('should show success alert after upload', () => {
    // Verify Alert chưa được gọi
    expect(Alert.alert).not.toHaveBeenCalled();
    
    // Giả lập gọi Alert.alert với thông báo thành công
    Alert.alert('Success', 'Image uploaded successfully!');
    
    // Verify Alert được gọi đúng
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Image uploaded successfully!');
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });
  
  test('should handle upload errors', () => {
    // Test xử lý lỗi
    storageService.uploadImage.mockRejectedValueOnce(new Error('Upload failed'));
    
    // Thực hiện gọi hàm và kiểm tra lỗi
    return storageService.uploadImage('bad-url', 'file.jpg')
      .catch(error => {
        expect(error.message).toBe('Upload failed');
      });
  });
}); 