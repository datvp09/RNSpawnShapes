import React, {createContext, useState} from 'react';
import {Text, View} from 'react-native';
import {
  createStackNavigator,
  CardStyleInterpolators,
  HeaderBackButton,
} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen, SharedTransitionIconScreen} from '@screens';
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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// const SourceContext = createContext({
//   source: '',
// });

const SquareStack = () => (
  <Stack.Navigator>
    <Stack.Screen name={'Squares'} component={SquareScreen} />
  </Stack.Navigator>
);
const CircleStack = () => (
  <Stack.Navigator>
    <Stack.Screen name={'Circles'} component={CircleScreen} />
  </Stack.Navigator>
);
const TriangleStack = () => (
  <Stack.Navigator>
    <Stack.Screen name={'Triangles'} component={TriangleScreen} />
  </Stack.Navigator>
);
const AllStack = () => (
  <Stack.Navigator>
    <Stack.Screen name={'All'} component={AllScreen} />
  </Stack.Navigator>
);

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
              // color={'white'}
              // style={{marginRight: 10}}
              // onPress={() => {
              //   console.log('source: ', route.params?.source);
              //   setSource(route.params?.source);
              //   setIsModalVisible(true);
              // }}
            />
          );
        },
        // headerTruncatedBackTitle: intl.formatMessage({id: 'button.back'}),
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
    // <Stack.Navigator
    //   screenOptions={({route}) => ({
    //     gestureEnabled: false,
    //     cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    //     headerTitleStyle: {color: 'white'},
    //     headerStyle: {
    //       backgroundColor: 'dodgerblue',
    //     },
    //     headerBackTitleStyle: {color: 'white'},
    //     headerTintColor: 'white',
    //     headerRight: () => (
    //       <Icon
    //         name={'info'}
    //         color={'white'}
    //         style={{marginRight: 10}}
    //         onPress={() => {
    //           console.log('source: ', route.params?.source);
    //           setSource(route.params?.source);
    //           setIsModalVisible(true);
    //         }}
    //       />
    //     ),
    //   })}
    //   initialRouteName={'HomeScreen'}>
    //   <Stack.Screen
    //     name="HomeScreen"
    //     component={HomeScreen}
    //     options={{
    //       title: 'Animation Playground',
    //       headerRight: null,
    //     }}
    //   />
    //   <Stack.Screen
    //     name="SharedTransitionIconScreen"
    //     component={SharedTransitionIconScreen}
    //     options={{
    //       title: 'Shared Transition Icon',
    //     }}
    //   />
    // </Stack.Navigator>
  );
};

export default Router;
