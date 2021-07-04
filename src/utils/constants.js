import {Dimensions, Platform} from 'react-native';

const COLOR_URL = 'https://www.colourlovers.com/api/colors/random?format=json';
const IMAGE_URL =
  'https://www.colourlovers.com/api/patterns/random?format=json';
const SMALLEST_SCREEN_PERCENT = 10;
const BIGGEST_SCREEN_PERCENT = 45;
const ITEMS_EACH_FETCH = 20;
const ITEMS_LEFT_TO_FETCH_AGAIN = 10;
const {height, width} = Dimensions.get('screen');
const isiOS = Platform.OS == 'ios';
const isAndroid = Platform.OS == 'android';

export {
  COLOR_URL,
  IMAGE_URL,
  SMALLEST_SCREEN_PERCENT,
  BIGGEST_SCREEN_PERCENT,
  ITEMS_EACH_FETCH,
  ITEMS_LEFT_TO_FETCH_AGAIN,
  width,
  height,
  isiOS,
  isAndroid,
};
