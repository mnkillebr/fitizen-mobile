/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#ffd700';
const tintColorDark = '#ffd700';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#ffed89',
    tabIconDefault: '#ffed89',
    tabIconSelected: tintColorLight,
    border: '#4d4d53',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#d8b600',
    tabIconDefault: '#d8b600',
    tabIconSelected: tintColorDark,
    border: '#4d4d53',
    textMuted: '#78716c',
    focus: '#a16207',
  },
};
