import React from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    Autocomplete,
    TextField,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
} from '@mui/material';
import {
    Print,
    Save,
    Undo,
    Redo,
    ZoomIn,
    ZoomOut,
    ArrowBack,
    FolderOpen,
    Delete,
} from '@mui/icons-material';
import { useLabelStore } from '../../stores/labelStore';
import { invoke } from '@tauri-apps/api/core';
import {
    saveDesign,
    getPrinters,
    Printer,
    getDesigns,
    updateDesign,
    deleteDesign,
} from '../../services/db';
import { useState, useEffect } from 'react';

interface TopBarProps {
    onBack?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onBack }) => {
    const { zoom, actions, height, activePrinter, elements, currentDesign } =
        useLabelStore();
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openLoadDialog, setOpenLoadDialog] = useState(false);
    const [designName, setDesignName] = useState('');
    const [savedDesigns, setSavedDesigns] = useState<any[]>([]);

    // Toast State
    const [toast, setToast] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        const fetchPrinters = async () => {
            const list = await getPrinters();
            setPrinters(list);
        };
        fetchPrinters();
    }, []);

    const handlePrinterChange = (_: any, newValue: Printer | null) => {
        if (newValue) {
            actions.setActivePrinter(newValue);
            // Update width based on printer, keep current height, and center elements
            actions.resizeAndCenter(newValue.max_printable_width_mm, height);
        }
    };

    const handleSaveClick = () => {
        if (currentDesign) {
            setDesignName(currentDesign.name);
        } else {
            setDesignName('');
        }
        setOpenDialog(true);
    };

    const handleLoadClick = async () => {
        const designs = await getDesigns();
        setSavedDesigns(designs as any[]);
        setOpenLoadDialog(true);
    };

    const handleSelectDesign = (design: any) => {
        try {
            const loadedElements = JSON.parse(design.content);
            actions.loadDesign(design.id, design.name, loadedElements);
            showToast(`Diseño "${design.name}" cargado`);
            setOpenLoadDialog(false);
        } catch (e) {
            console.error('Error parsing design:', e);
            showToast('Error al cargar el diseño', 'error');
        }
    };

    const handleDeleteDesign = async (id: number) => {
        if (confirm('¿Estás seguro de eliminar este diseño?')) {
            try {
                await deleteDesign(id);
                const designs = await getDesigns();
                setSavedDesigns(designs as any[]);
                showToast('Diseño eliminado');
            } catch (e) {
                console.error('Error deleting design:', e);
                showToast('Error al eliminar', 'error');
            }
        }
    };

    const showToast = (
        message: string,
        severity: 'success' | 'error' = 'success'
    ) => {
        setToast({ open: true, message, severity });
    };

    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    };

    const handleConfirmSave = async () => {
        if (!designName.trim()) {
            showToast('Por favor ingresa un nombre para el diseño', 'error');
            return;
        }
        try {
            // Check if updating existing design
            if (currentDesign && currentDesign.name === designName) {
                await updateDesign(
                    currentDesign.id,
                    designName,
                    JSON.stringify(elements)
                );
                showToast('Diseño actualizado correctamente');
            } else {
                // Save new design
                const newId = await saveDesign(
                    designName,
                    JSON.stringify(elements)
                );
                // Update current design context
                if (newId) {
                    actions.setCurrentDesign({
                        id: newId as number,
                        name: designName,
                    });
                }
                showToast('Diseño guardado correctamente');
            }

            setOpenDialog(false);
            setDesignName('');
        } catch (error) {
            console.error('Error saving design:', error);
            showToast('Error al guardar el diseño', 'error');
        }
    };

    const handlePrint = async () => {
        if (!activePrinter) {
            showToast('Por favor selecciona una impresora primero', 'error');
            return;
        }
        try {
            const res = await invoke('print_label', {
                printerName: activePrinter.name,
                data: JSON.stringify(elements),
            });
            console.log('Print result:', res);
            showToast(`Enviado a imprimir a ${activePrinter.name}`);
        } catch (error) {
            console.error('Print error:', error);
            showToast('Error al imprimir', 'error');
        }
    };

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    height: 64,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    bgcolor: 'white',
                    justifyContent: 'space-between',
                    zIndex: 10,
                }}
            >
                {/* Left: Printer Select */}
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ width: 400 }}
                >
                    <IconButton onClick={onBack} sx={{ mr: 1 }}>
                        <ArrowBack />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            L
                        </div>
                        <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{ lineHeight: 1 }}
                        >
                            LabelDesigner{' '}
                            <span className="text-gray-400 text-xs font-normal">
                                V1.0.4
                            </span>
                        </Typography>
                    </Box>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ height: 24, my: 'auto' }}
                    />
                    <Autocomplete
                        disablePortal
                        options={printers}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                        }
                        onChange={handlePrinterChange}
                        size="small"
                        sx={{ width: 250 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Seleccionar Impresora..."
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <Print
                                                fontSize="small"
                                                sx={{
                                                    color: 'text.secondary',
                                                    mr: 1,
                                                }}
                                            />
                                            {params.InputProps.startAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Stack>

                {/* Center: Zoom Controls */}
                <Paper
                    variant="outlined"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.5,
                        borderRadius: 10,
                    }}
                >
                    <IconButton
                        size="small"
                        // onClick={() => actions.undo()}
                        disabled={true} //{!actions.canUndo}
                    >
                        <Undo fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        // onClick={() => actions.redo()}
                        disabled={true} //{!actions.canRedo}
                    >
                        <Redo fontSize="small" />
                    </IconButton>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ mx: 1, height: 20, my: 'auto' }}
                    />
                    <IconButton
                        size="small"
                        onClick={() =>
                            actions.setZoom(Math.max(0.1, zoom - 0.1))
                        }
                    >
                        <ZoomOut fontSize="small" />
                    </IconButton>
                    <Typography
                        variant="caption"
                        sx={{
                            minWidth: 40,
                            textAlign: 'center',
                            fontWeight: 'bold',
                        }}
                    >
                        {Math.round(zoom * 100)}%
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => actions.setZoom(Math.min(3, zoom + 0.1))}
                    >
                        <ZoomIn fontSize="small" />
                    </IconButton>
                </Paper>

                {/* Right: Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="text"
                        startIcon={<FolderOpen />}
                        color="inherit"
                        onClick={handleLoadClick}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Abrir
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Save />}
                        color="inherit"
                        onClick={handleSaveClick}
                        sx={{
                            borderColor: 'divider',
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Guardar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Print />}
                        disableElevation
                        onClick={handlePrint}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                        }}
                    >
                        Imprimir
                    </Button>
                </Box>
            </Paper>

            {/* Save Design Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    {currentDesign ? 'Actualizar Diseño' : 'Guardar Diseño'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Ingresa un nombre para identificar este diseño.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre del Diseño"
                        fullWidth
                        variant="outlined"
                        value={designName}
                        onChange={(e) => setDesignName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        color="inherit"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmSave}
                        variant="contained"
                        disableElevation
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Load Design Dialog */}
            <Dialog
                open={openLoadDialog}
                onClose={() => setOpenLoadDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Abrir Diseño</DialogTitle>
                <DialogContent dividers>
                    {savedDesigns.length === 0 ? (
                        <Typography
                            color="text.secondary"
                            align="center"
                            sx={{ py: 4 }}
                        >
                            No hay diseños guardados.
                        </Typography>
                    ) : (
                        <List>
                            {savedDesigns.map((design) => (
                                <ListItem
                                    key={design.id}
                                    disablePadding
                                    divider
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() =>
                                                handleDeleteDesign(design.id)
                                            }
                                        >
                                            <Delete />
                                        </IconButton>
                                    }
                                >
                                    <ListItemButton
                                        onClick={() =>
                                            handleSelectDesign(design)
                                        }
                                    >
                                        <FolderOpen
                                            sx={{
                                                mr: 2,
                                                color: 'text.secondary',
                                            }}
                                        />
                                        <ListItemText
                                            primary={design.name}
                                            secondary={new Date(
                                                design.updated_at
                                            ).toLocaleString()}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenLoadDialog(false)}
                        color="inherit"
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Global Toast Notification */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseToast}
                    severity={toast.severity}
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </>
    );
};
