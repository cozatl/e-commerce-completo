// Definition of main DefaulTheme to be used in all the project and be recognized in all modules

import 'styled-components';
import theme from './Components/Theme'

type ThemeType = typeof theme;
declare module 'styled-components' {
    export interface DefaultTheme extends ThemeType {}
}