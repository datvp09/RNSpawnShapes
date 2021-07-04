import {SMALLEST_SCREEN_PERCENT, BIGGEST_SCREEN_PERCENT, width} from '@utils';

// Gets the current screen from navigation state
export const getActiveRouteName = state => {
  const route = state.routes[state.index];

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route.name;
};

export const randomNumberFrom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const randomShapeSize = () => {
  const percent = randomNumberFrom(
    SMALLEST_SCREEN_PERCENT,
    BIGGEST_SCREEN_PERCENT,
  );
  const size = (percent / 100) * width;

  return size;
};

export const getBase64FromUrl = async url => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

export const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

export const timeoutAsync = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isValidBase64 = text => {
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  return base64regex.test(text);
};

export const isValidURL = str => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
};
