import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Icon} from 'react-native-elements';
import {
  ROUTE_SQUARES,
  ROUTE_CIRCLES,
  ROUTE_TRIANGLES,
  ROUTE_ALL,
  inactiveColor,
  activeColor,
  isAndroid,
} from '@utils';
import {AllScreen, TriangleScreen, CircleScreen, SquareScreen} from '@screens';

const Tab = createBottomTabNavigator();

const Router = () => {
  const tabBarOptions = {
    activeTintColor: activeColor,
    inactiveTintColor: inactiveColor,
  };
  if (isAndroid) {
    tabBarOptions.labelStyle = {paddingBottom: 10};
    tabBarOptions.style = {height: 60};
  }
  return (
    <Tab.Navigator
      tabBarOptions={tabBarOptions}
      lazy={false}
      backBehavior={'initialRoute'}
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          const iconColor = focused ? activeColor : inactiveColor;
          let iconSize = 20;
          let iconName;
          if (route.name == ROUTE_SQUARES) {
            iconName = 'home';
          } else if (route.name == ROUTE_CIRCLES) {
            iconName = 'account-circle';
            iconSize = 18;
          } else if (route.name == ROUTE_TRIANGLES) {
            iconName = 'warning';
            iconSize = 18;
          } else if (route.name == ROUTE_ALL) {
            iconName = 'done-all';
          }

          return (
            <Icon
              name={iconName}
              color={focused ? activeColor : inactiveColor}
            />
          );
        },
      })}>
      <Tab.Screen
        name={ROUTE_SQUARES}
        options={({route}) => ({tabBarLabel: 'Squares'})}
        component={SquareScreen}
      />
      <Tab.Screen
        name={ROUTE_CIRCLES}
        options={({route}) => ({tabBarLabel: 'Circles'})}
        component={CircleScreen}
      />
      <Tab.Screen
        name={ROUTE_TRIANGLES}
        options={({route}) => ({tabBarLabel: 'Triangles'})}
        component={TriangleScreen}
      />
      <Tab.Screen
        name={ROUTE_ALL}
        options={({route}) => ({tabBarLabel: 'All'})}
        component={AllScreen}
      />
    </Tab.Navigator>
  );
};

export default Router;
