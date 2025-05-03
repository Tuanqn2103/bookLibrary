// Mock để xử lý các thành phần React Native không thể test trực tiếp
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock cho Blob
global.Blob = function(content, options) {
  return {
    content,
    options,
    type: options?.type || 'application/octet-stream',
    size: content?.reduce((acc, item) => acc + item.length, 0) || 0
  };
};

// Mock cho setTimout và các API thời gian
jest.useFakeTimers();

// Mock cho Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Tắt logs trong quá trình test
console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn(); 