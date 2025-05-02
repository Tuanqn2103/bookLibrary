# Chiến lược Testing

## Tổng quan
Dự án sử dụng Jest làm framework chính cho việc kiểm thử, với các chiến lược kiểm thử đã được triển khai cho nhiều tầng ứng dụng khác nhau.

## Các chiến lược đã sử dụng

### 1. Unit Tests
- **Đối tượng**: Các service riêng lẻ
- **Thư mục**: `src/__tests__/unit/`
- **Phạm vi**: Kiểm tra các hàm trong từng service một cách độc lập
- **Chiến lược mocking**: Sử dụng Jest mock để giả lập kết nối Supabase

### 2. Integration Tests
- **Đối tượng**: Luồng xử lý giữa các service
- **Thư mục**: `src/__tests__/integration/`
- **Phạm vi**: Kiểm tra tương tác giữa các service và các thành phần UI
- **Chiến lược mocking**: Mocking các API và response thực tế

### 3. Component Tests
- **Đối tượng**: UI Components
- **Thư mục**: `src/__tests__/components/`
- **Phạm vi**: Kiểm tra chức năng render và hoạt động của components
- **Chiến lược**: Mocking các dependencies và kiểm tra props, events

### 4. Screen Tests
- **Đối tượng**: Các màn hình trong ứng dụng
- **Thư mục**: `src/__tests__/screens/`
- **Phạm vi**: Kiểm tra các màn hình hoàn chỉnh
- **Chiến lược**: Mocking navigation, service calls, và kiểm tra các trạng thái hiển thị

## Kỹ thuật mocking

1. **Service Mocking**: 
   ```javascript
   jest.mock('../../services/auth.service', () => ({
     authService: {
       login: jest.fn(),
       getUserProfile: jest.fn()
     }
   }));
   ```

2. **React Native Components**:
   ```javascript
   jest.mock('react-native', () => {
     const rn = jest.requireActual('react-native');
     return {
       ...rn,
       View: 'View',
       Text: 'Text',
       // Các component khác
     };
   });
   ```

3. **Navigation Mocking**:
   ```javascript
   jest.mock('@react-navigation/native', () => ({
     useNavigation: jest.fn(() => ({
       navigate: jest.fn(),
       goBack: jest.fn()
     }))
   }));
   ```

## Chiến lược bao phủ (Coverage)

Các tests tập trung vào bao phủ các trường hợp:
- Happy path (luồng xử lý thành công)
- Error handling (xử lý lỗi)
- Edge cases (các trường hợp biên)

## Các lệnh Test

### Chạy tất cả tests
```bash
npx jest
```

### Chạy tests cho một loại cụ thể
```bash
# Unit tests
npx jest src/__tests__/unit

# Integration tests
npx jest src/__tests__/integration

# Screen tests
npx jest src/__tests__/screens
```

### Chạy test cho một file cụ thể
```bash
npx jest src/__tests__/unit/auth.service.test.js
```

### Chạy tests với coverage report
```bash
npx jest --coverage
```

### Chạy tests ở chế độ watch (tự động chạy lại khi có thay đổi)
```bash
npx jest --watch
```

### Đánh dấu đặc biệt test nào đó
```javascript
// Để tạm thời bỏ qua test
test.skip('should...', () => {});

// Để chỉ chạy đúng test này
test.only('should...', () => {});
```

## Cấu trúc test điển hình

```javascript
describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('nên đăng nhập thành công với thông tin hợp lệ', async () => {
      // Arrange - chuẩn bị dữ liệu
      
      // Act - gọi hàm cần test
      
      // Assert - kiểm tra kết quả
    });
    
    test('nên báo lỗi với thông tin không hợp lệ', async () => {
      // Test logic
    });
  });
});
```

## Báo cáo bao phủ hiện tại

Sau các cập nhật mới nhất, độ bao phủ của dự án đã được cải thiện đáng kể:

### Tổng quan
- **Statement**: 79.42%
- **Branch**: 73.33%
- **Function**: 74.28%
- **Line**: 80.34%

### Kết quả theo module
| Module           | Line Coverage | Notes                           |
|------------------|---------------|----------------------------------|
| author.service.js   | 100%          | Hoàn thiện các test cho tất cả phương thức |
| category.service.js | 100%          | Hoàn thiện các test cho tất cả phương thức |
| storage.service.js  | 100%          | Hoàn thiện các test cho tất cả phương thức |
| auth.service.js     | 92.1%         | Còn một số trường hợp edge case chưa test |
| database.service.js | 98.9%         | Gần như hoàn thiện với chỉ 1 dòng chưa test |
| book.service.js     | 57.44%        | Còn nhiều phương thức cần bổ sung test |
| Components          | 11.11%        | Còn thiếu nhiều test cho các component UI |

### Cải tiến gần đây
1. Đã thêm tests cho các service chính:
   - Tất cả các phương thức của `userService`
   - Tất cả các phương thức của `borrowingService` 
   - Tất cả các phương thức của `bookService` (direct)
   - Cập nhật và mở rộng các test cho `databaseService`

2. Mỗi service test file có cấu trúc nhất quán:
   - Test happy path (xử lý thành công)
   - Test error handling (xử lý lỗi)
   - Mocking đầy đủ các dependency

3. Tổng số test hiện tại: 176 tests, trong 19 test suites

## Hướng cải tiến tiếp theo

1. **Tập trung vào Components**: Cải thiện coverage cho các UI components từ mức 11.11% hiện tại.

2. **Hoàn thiện book.service.js**: Bổ sung thêm test cho các phương thức còn thiếu.

3. **E2E Tests**: Xem xét bổ sung end-to-end tests để kiểm tra toàn bộ luồng xử lý của ứng dụng.

4. **Mock API**: Xây dựng hệ thống mock API tốt hơn để tránh phụ thuộc vào Supabase trong quá trình test. 