import React from 'react';
import { Box, Paper } from '@mui/material';
import { TopBar } from '../../components/LabelDesigner/TopBar';
import { Toolbar } from '../../components/LabelDesigner/Toolbar';
import { CanvasEditor } from '../../components/LabelDesigner/CanvasEditor';
import { PropertiesPanel } from '../../components/LabelDesigner/PropertiesPanel';
// import { StatusBar } from '../../components/LabelDesigner/StatusBar';

interface DesignerPageProps {
    onBack?: () => void;
}

export const DesignerPage: React.FC<DesignerPageProps> = ({ onBack }) => {
    return (
        <Box
            sx={{
                height: '100vh', // Changed from calc(100vh - 64px) to 100vh since we removed the App bar
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                overflow: 'hidden',
            }}
        >
            <TopBar onBack={onBack} />

            <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar Left: Toolbar */}
                <Paper
                    elevation={0}
                    square
                    sx={{
                        width: 64,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 1,
                    }}
                >
                    <Toolbar />
                </Paper>

                {/* Main Content: Canvas */}
                <Box
                    sx={{
                        flexGrow: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#e2e8f0', // Slate 200 for better contrast with white canvas
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage:
                            'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                >
                    <CanvasEditor />
                </Box>

                {/* Sidebar Right: Properties */}
                <Paper
                    elevation={0}
                    square
                    sx={{
                        width: 300,
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper',
                        zIndex: 1,
                    }}
                >
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        <PropertiesPanel />
                    </Box>
                </Paper>
            </Box>

            {/* <StatusBar /> */}
        </Box>
    );
};
