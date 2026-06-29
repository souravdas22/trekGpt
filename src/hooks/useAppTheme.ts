import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { lightColors, darkColors, ColorsType } from '../theme/colors';

export const useAppTheme = (): ColorsType => {
  const theme = useSelector((state: RootState) => state.settings.theme);
  
  if (theme === 'light') {
    return lightColors;
  }
  
  return darkColors;
};
