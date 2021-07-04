import React, {useEffect, useRef} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar, UIManager} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {getActiveRouteName, isAndroid} from '@utils';
import {navService} from '@core/services';
import RootNavigator from '@core/navigators/RootNavigator';

if (isAndroid && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const App = () => {
  const navigationRef = useRef();
  const routeNameRef = useRef(); // use to store previous route name

  useEffect(() => {
    if (navigationRef.current) {
      const state = navigationRef.current.getRootState();
      // Save the initial route name
      routeNameRef.current = getActiveRouteName(state);
      navService.setNavigator(navigationRef.current);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={state => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = getActiveRouteName(state);
          navService.onNavigationStateChange(
            previousRouteName,
            currentRouteName,
          );
          routeNameRef.current = currentRouteName;
        }}>
        <StatusBar
          backgroundColor={'transparent'}
          translucent={true}
          barStyle={'dark-content'}
        />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
