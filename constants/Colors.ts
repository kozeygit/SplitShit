/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { YellowBox } from "react-native";

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  pastel: {
    pink: '#FFC6FF',
    red: '#FAA0A0',
    orange: '#FAC898',
    yellow: '#FDFFB6',
    green: '#C1E1C1',
    turquoise: '#98F5E1',
    cyan: '#ADD8E6',
    blue: '#A7C7E7',
    indigo: '#A0C4FF',
    violet: '#BDB2FF'
  },
  darkPastel: {
    pink: '#B370B3',
    red: '#C16060',
    orange: '#B58352',
    yellow: '#A9AD5E',
    green: '#6B8E6B',
    turquoise: '#4A9E8A',
    cyan: '#5B8A9E',
    blue: '#56799C',
    indigo: '#5271AD',
    violet: '#6B5BB3',
  },
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    placeholderText: '#687076',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    placeholderText: '#9BA1A6',
  },
};
