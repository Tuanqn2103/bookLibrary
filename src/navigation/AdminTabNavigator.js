import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import StatsScreen from '../screens/admin/StatsScreen';
import ProfileScreen from '../screens/admin/ProfileScreen';

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        height: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: 'absolute',
        backgroundColor: 'white',
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Stats') iconName = 'bar-chart-2';
        else if (route.name === 'Profile') iconName = 'user';
        return <Icon name={iconName} size={24} color={focused ? '#6B4EFF' : '#222'} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={AdminHomeScreen} />
    <Tab.Screen name="Stats" component={StatsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default AdminTabNavigator; 