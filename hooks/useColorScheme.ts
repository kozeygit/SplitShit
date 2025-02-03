// export { useColorScheme } from 'react-native';

import { ColorSchemeName, useColorScheme as useCS} from 'react-native';

export function useColorScheme(): ColorSchemeName {
    useCS()
    return 'light'
}


//! Used force light mode for now, swap what is commented out to go back