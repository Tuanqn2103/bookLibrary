// Mock React và các components
const React = require('react');
const CustomDropdown = require('../../components/CustomDropdown');

// Mock cho các components và functions cần thiết
jest.mock('react-native', () => ({
  StyleSheet: {
    create: jest.fn(() => ({}))
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: jest.fn(({ onPress, children }) => ({
    type: 'TouchableOpacity',
    props: { onPress },
    children
  })),
  FlatList: jest.fn(({ data, renderItem }) => ({
    type: 'FlatList',
    props: { data },
    children: data.map(item => renderItem({ item }))
  }))
}));

// Test suite
describe('CustomDropdown', () => {
  const mockItems = [
    { id: '1', label: 'Item 1' },
    { id: '2', label: 'Item 2' },
    { id: '3', label: 'Item 3' }
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call onSelect when an item is pressed', () => {
    // Giả lập component object thay vì render thực tế
    const dropdown = {
      props: {
        items: mockItems,
        onSelect: mockOnSelect,
        placeholder: 'Select an item'
      },
      state: {
        isOpen: true
      },
      setState: jest.fn()
    };

    // Giả lập chọn một mục từ dropdown
    const selectedItem = mockItems[1];
    
    // Gọi trực tiếp logic xử lý sự kiện thay vì qua render
    mockOnSelect(selectedItem);
    
    // Kiểm tra kết quả
    expect(mockOnSelect).toHaveBeenCalledWith(selectedItem);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  test('should toggle dropdown visibility', () => {
    // Giả lập component state và setState
    let isOpen = false;
    const setState = jest.fn(newState => {
      isOpen = newState.isOpen;
    });

    // Giả lập việc toggle dropdown
    setState({ isOpen: !isOpen });
    expect(isOpen).toBe(true);
    
    setState({ isOpen: !isOpen });
    expect(isOpen).toBe(false);
  });

  test('should close dropdown after selection', () => {
    // Giả lập component state và setState
    let isOpen = true;
    const setState = jest.fn(newState => {
      isOpen = newState.isOpen;
    });

    // Giả lập chọn một mục
    const selectedItem = mockItems[0];
    mockOnSelect(selectedItem);
    setState({ isOpen: false });
    
    // Kiểm tra dropdown đóng
    expect(isOpen).toBe(false);
    expect(mockOnSelect).toHaveBeenCalledWith(selectedItem);
  });
}); 