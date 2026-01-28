import React from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Stack,
    IconButton,
    Button,
} from '@mui/material';
import {
    DescriptionOutlined,
    SettingsOutlined,
    TableChartOutlined,
    DesignServicesOutlined,
    FolderOpenOutlined,
    DeleteOutline,
} from '@mui/icons-material';
import { getDesigns, deleteDesign } from '../../services/db';
import { useLabelStore } from '../../stores/labelStore';

interface HomeProps {
    onNavigate: (view: 'excel' | 'designer' | 'docs' | 'settings') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    const [savedDesigns, setSavedDesigns] = React.useState<any[]>([]);
    const { actions } = useLabelStore();

    const loadDesigns = React.useCallback(async () => {
        const designs = await getDesigns();
        setSavedDesigns(designs as any[]);
    }, []);

    React.useEffect(() => {
        loadDesigns();
    }, [loadDesigns]);

    const handleOpenDesign = (design: any) => {
        try {
            const elements = JSON.parse(design.content);
            actions.loadDesign(design.id, design.name, elements);
            onNavigate('designer');
        } catch (e) {
            console.error('Error parsing design content', e);
            alert('Error al abrir el diseño');
        }
    };

    const handleDeleteDesign = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de eliminar este diseño?')) {
            await deleteDesign(id);
            loadDesigns();
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#f8fafc', // Slate-50
                color: '#0f172a', // Slate-900
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                component="header"
                sx={{
                    px: 4,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#3b82f6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}
                    >
                        <DescriptionOutlined fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Diseñador de Etiquetas
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                    <Button
                        color="inherit"
                        sx={{ textTransform: 'none' }}
                        onClick={() => onNavigate('docs')}
                    >
                        Documentación
                    </Button>
                    <IconButton
                        size="small"
                        onClick={() => onNavigate('settings')}
                    >
                        <SettingsOutlined />
                    </IconButton>
                </Stack>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, overflow: 'auto', width: '100%' }}>
                <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
                    {/* Hero */}
                    <Box textAlign="center" mb={6}>
                        <Typography
                            variant="h3"
                            component="h1"
                            fontWeight="bold"
                            gutterBottom
                            sx={{ color: '#1e293b' }}
                        >
                            ¿Listo para empezar?
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Comienza un nuevo diseño o importa tus datos para
                            <br /> generar etiquetas masivamente.
                        </Typography>
                    </Box>

                    {/* Action Cards */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: 4,
                            mb: 8,
                            maxWidth: 900,
                            mx: 'auto',
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                height: '100%',
                                bgcolor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow:
                                        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                    borderColor: '#cbd5e1',
                                },
                            }}
                            onClick={() => onNavigate('excel')}
                        >
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: '#eff6ff',
                                    color: '#3b82f6',
                                    borderRadius: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}
                            >
                                <TableChartOutlined fontSize="large" />
                            </Box>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                gutterBottom
                            >
                                Importar Datos
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Carga archivos Excel o CSV para llenar
                                automáticamente tus plantillas de etiquetas.
                            </Typography>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                height: '100%',
                                bgcolor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow:
                                        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                    borderColor: '#cbd5e1',
                                },
                            }}
                            onClick={() => onNavigate('designer')}
                        >
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: '#eff6ff',
                                    color: '#3b82f6',
                                    borderRadius: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}
                            >
                                <DesignServicesOutlined fontSize="large" />
                            </Box>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                gutterBottom
                            >
                                Crear Diseño
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Abre el editor visual para diseñar una nueva
                                etiqueta desde cero.
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Saved Designs */}
                    <Box>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={3}
                        >
                            <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                color="text.secondary"
                                sx={{ letterSpacing: 1 }}
                            >
                                MIS DISEÑOS GUARDADOS
                            </Typography>
                        </Stack>

                        {savedDesigns.length === 0 ? (
                            <Typography
                                color="text.secondary"
                                sx={{ fontStyle: 'italic' }}
                            >
                                No hay diseños guardados aún.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: '1fr 1fr',
                                        md: '1fr 1fr 1fr 1fr',
                                    },
                                    gap: 2,
                                }}
                            >
                                {savedDesigns.map((design) => (
                                    <Paper
                                        key={design.id}
                                        variant="outlined"
                                        onClick={() => handleOpenDesign(design)}
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            bgcolor: 'white',
                                            borderColor: '#e2e8f0',
                                            '&:hover': {
                                                borderColor: '#3b82f6',
                                                bgcolor: '#f8fafc',
                                                transform: 'translateY(-2px)',
                                                boxShadow:
                                                    '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            },
                                            transition: 'all 0.2s',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            group: 'true',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                p: 1,
                                                bgcolor: '#f1f5f9',
                                                borderRadius: 1,
                                                color: '#64748b',
                                            }}
                                        >
                                            <FolderOpenOutlined fontSize="small" />
                                        </Box>
                                        <Box
                                            sx={{ overflow: 'hidden', flex: 1 }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="bold"
                                                noWrap
                                                title={design.name}
                                            >
                                                {design.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {new Date(
                                                    design.updated_at
                                                ).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) =>
                                                handleDeleteDesign(e, design.id)
                                            }
                                            sx={{
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                '.MuiPaper-root:hover &': {
                                                    opacity: 1,
                                                },
                                                color: '#ef4444',
                                            }}
                                        >
                                            <DeleteOutline fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};
