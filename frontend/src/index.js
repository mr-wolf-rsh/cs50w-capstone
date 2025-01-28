import React from 'react';

import { createRoot } from 'react-dom/client';

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { Provider } from 'react-redux';

import {
  CssBaseline,
  useMediaQuery
} from '@mui/material';

import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider
} from '@mui/material/styles';

import { AnimatePresence } from 'framer-motion';

import json2mq from 'json2mq';

import { DeviceContextProvider } from './contexts/Device';

import { AlertNotification } from './components/common';
import { NoMatch } from './components/routing-helpers';

import {
  App,
  AllCandidates,
  AllParties,
  AllPolls,
  Candidate,
  Home,
  Main,
  Login,
  Party,
  Register
} from './pages';

import reportWebVitals from './reportWebVitals';

import store from './store';

export default function AppRouter() {
  const prefersColorScheme = useMediaQuery(json2mq({ prefersColorScheme: 'dark' }));

  const theme = React.useMemo(
    () => responsiveFontSizes(
      createTheme({
        palette: {
          mode: prefersColorScheme ? 'dark' : 'light',
          primary: {
            main: '#00438d',
            light: '#0067da',
            dark: '#001f41',
            contrastText: '#fff'
          },
          secondary: {
            main: '#e4b92b',
            light: '#edcf6f',
            dark: '#ad8a16',
            contrastText: '#fff'
          },
          neutral: {
            main: '#7a655f',
            light: '#a08b85',
            dark: '#4f413e',
            contrastText: '#fff'
          }
        },
        typography: {
          fontFamily: "'Josefin Sans', sans-serif"
        },
        spacing: 5,
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              html: {
                height: '100%'
              },
              body: {
                height: '100%'
              },
              '#react-app': {
                height: '100%',
                display: 'flex'
              }
            }
          }
        }
      })
    ),
    [prefersColorScheme]
  );

  const notFoundRedirectRoute = <Route path="*" element={<Navigate to="/not-found" replace />} />;

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <DeviceContextProvider>
          <CssBaseline />
          <AnimatePresence mode="wait">
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to="/app" />} />
                <Route index element={<Home />} />
                <Route path="/app" element={<App />}>
                  <Route index element={<Main />} />
                  <Route path={'candidate'}>
                    <Route index element={<AllCandidates />} />
                    <Route path={':uuid'} element={<Candidate />} />
                  </Route>
                  <Route path={'party'}>
                    <Route index element={<AllParties />} />
                    <Route path={':uuid'} element={<Party />} />
                  </Route>
                  <Route path={'poll'} element={<AllPolls />} />
                  {notFoundRedirectRoute}
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/not-found" element={<NoMatch />} />
                {notFoundRedirectRoute}
              </Routes>
              <AlertNotification />
            </Router>
          </AnimatePresence>
        </DeviceContextProvider>
      </Provider>
    </ThemeProvider>
  );
};

let container = null;

document.addEventListener('DOMContentLoaded', function (_) {
  if (!container) {
    container = document.getElementById('react-app');
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <AppRouter />
      </React.StrictMode>
    );
  }
});

reportWebVitals(console.log);
