import { useState, useEffect } from 'react';
import { CssBaseline, Box, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { ExcelUploader } from './components/ExcelUploader/ExcelUploader';
import { DesignerPage } from './pages/Designer/Designer';
import { Home } from './pages/Home/Home';
import { Documentation } from './components/Documentation/Documentation';
import { Settings } from './components/Settings/Settings';
import { initDB, syncPrintersFromJSON } from './services/db';
import { getCurrentWindow } from '@tauri-apps/api/window';

function App() {
    const [currentView, setCurrentView] = useState<
        'home' | 'excel' | 'designer' | 'docs' | 'settings'
    >('home');

    useEffect(() => {
        const appWindow = getCurrentWindow();
        setTimeout(() => {
            appWindow.show();
        }, 100);
    }, []);

    useEffect(() => {
        const init = async () => {
            await initDB();
            await syncPrintersFromJSON();
        };
        init();
    }, []);

    const navigateTo = (view: 'excel' | 'designer' | 'docs' | 'settings') => {
        setCurrentView(view);
    };

    const handleBackToHome = () => {
        setCurrentView('home');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                {currentView === 'home' && <Home onNavigate={navigateTo} />}
                {currentView === 'excel' && (
                    <ExcelUploader onBack={handleBackToHome} />
                )}
                {currentView === 'designer' && (
                    <DesignerPage onBack={handleBackToHome} />
                )}
                {currentView === 'docs' && (
                    <Documentation onBack={handleBackToHome} />
                )}
                {currentView === 'settings' && (
                    <Settings onBack={handleBackToHome} />
                )}
            </Box>
        </ThemeProvider>
    );
}

export default App;
