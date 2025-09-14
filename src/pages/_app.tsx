import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import theme from '../styles/theme';
import Layout from '../components/Layout';
import '../styles/globals.css';

const clientSideEmotionCache = createCache({ key: 'css' });

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </SessionProvider>
    </CacheProvider>
  );
}

export default MyApp;
