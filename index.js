import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed from React Native',
]);

// Global error handler
const errorHandler = (error, isFatal) => {
  console.log('Global error caught:', error);
  if (isFatal) {
    // You can add your own error reporting service here
    console.log('Fatal error occurred:', error);
  }
};

// Set up global error handler
ErrorUtils.setGlobalHandler(errorHandler);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
