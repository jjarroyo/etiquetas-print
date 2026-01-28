import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" color="error" gutterBottom>
                        Algo salió mal
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {this.state.error?.message}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                    >
                        Recargar
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}
