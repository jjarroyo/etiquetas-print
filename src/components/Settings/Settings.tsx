import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button,
    Divider,
    Container,
    Switch,
    FormControlLabel,
    Alert,
    IconButton,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack,
    Print,
    Settings as SettingsIcon,
    Info,
    Refresh,
    DeleteForever,
} from '@mui/icons-material';
import { getPrinters, syncPrintersFromJSON, Printer } from '../../services/db';

interface SettingsProps {
    onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState<{
        type: 'success' | 'error';
        msg: string;
    } | null>(null);

    // Mock settings state
    const [showGrid, setShowGrid] = useState(true);
    const [units, setUnits] = useState<'mm' | 'in'>('mm');

    const loadPrinters = async () => {
        const p = await getPrinters();
        setPrinters(p);
    };

    useEffect(() => {
        loadPrinters();
    }, []);

    const handleSyncPrinters = async () => {
        setLoading(true);
        setSyncStatus(null);
        try {
            await syncPrintersFromJSON();
            await loadPrinters();
            setSyncStatus({
                type: 'success',
                msg: 'Impresoras sincronizadas correctamente.',
            });
        } catch (error) {
            console.error(error);
            setSyncStatus({
                type: 'error',
                msg: 'Error al sincronizar impresoras.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    px: 4,
                    py: 2,
                }}
            >
                <Container
                    maxWidth="md"
                    sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                    <IconButton onClick={onBack} edge="start">
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                        Configuración
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
                <div className="space-y-8">
                    {/* Printers Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Print className="text-blue-600" />
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="text.primary"
                            >
                                Impresoras
                            </Typography>
                        </div>
                        <Paper
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                bgcolor: 'white',
                            }}
                        >
                            <Box
                                sx={{
                                    p: 3,
                                    bgcolor: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    IMPRESORAS DETECTADAS
                                </Typography>
                                <Button
                                    startIcon={<Refresh />}
                                    size="small"
                                    onClick={handleSyncPrinters}
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Sincronizando...'
                                        : 'Sincronizar'}
                                </Button>
                            </Box>

                            {syncStatus && (
                                <Alert
                                    severity={syncStatus.type}
                                    sx={{ borderRadius: 0 }}
                                >
                                    {syncStatus.msg}
                                </Alert>
                            )}

                            <List>
                                {printers.length === 0 ? (
                                    <ListItem>
                                        <ListItemText
                                            primary="No se encontraron impresoras"
                                            secondary="Asegúrese de que el archivo impresoras.json existe y es correcto."
                                        />
                                    </ListItem>
                                ) : (
                                    printers.map((printer, index) => (
                                        <React.Fragment
                                            key={printer.id || index}
                                        >
                                            <ListItem>
                                                <ListItemText
                                                    primary={printer.name}
                                                    secondary={`Ancho máx: ${printer.max_printable_width_mm}mm | DPI: ${JSON.parse(printer.resolutions_dpi as any).join(', ')}`}
                                                />
                                            </ListItem>
                                            {index < printers.length - 1 && (
                                                <Divider component="li" />
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </List>
                        </Paper>
                    </section>

                    {/* General Preferences */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <SettingsIcon className="text-gray-600" />
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="text.primary"
                            >
                                Preferencias Generales
                            </Typography>
                        </div>
                        <Paper
                            variant="outlined"
                            sx={{ borderRadius: 3, p: 3, bgcolor: 'white' }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showGrid}
                                            onChange={(e) =>
                                                setShowGrid(e.target.checked)
                                            }
                                        />
                                    }
                                    label="Mostrar cuadrícula en diseñador"
                                />
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        mb={1}
                                    >
                                        Unidad de Medida por Defecto
                                    </Typography>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={
                                                units === 'mm'
                                                    ? 'contained'
                                                    : 'outlined'
                                            }
                                            size="small"
                                            onClick={() => setUnits('mm')}
                                        >
                                            Milímetros (mm)
                                        </Button>
                                        <Button
                                            variant={
                                                units === 'in'
                                                    ? 'contained'
                                                    : 'outlined'
                                            }
                                            size="small"
                                            onClick={() => setUnits('in')}
                                        >
                                            Pulgadas (in)
                                        </Button>
                                    </div>
                                </Box>
                            </div>
                        </Paper>
                    </section>

                    {/* About */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="text-gray-600" />
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="text.primary"
                            >
                                Acerca de
                            </Typography>
                        </div>
                        <Paper
                            variant="outlined"
                            sx={{ borderRadius: 3, p: 3, bgcolor: 'white' }}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Etiquetas Print App
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Versión 0.1.0 (Beta)
                                    </Typography>
                                </div>
                                <Typography
                                    variant="caption"
                                    color="text.disabled"
                                >
                                    © 2026
                                </Typography>
                            </div>
                        </Paper>
                    </section>
                </div>
            </Container>
        </Box>
    );
};
