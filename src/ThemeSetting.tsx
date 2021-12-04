import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import App from './App';
import {useState} from 'react';

export default function ThemeSetting() {
  // hook will return either 'dark' or 'light' on client
  // and always 'light' during ssr as window.matchMedia is not available
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(preferredColorScheme);
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }}>
        <App />
      </MantineProvider>
    </ColorSchemeProvider>
  );
}