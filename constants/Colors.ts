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
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
