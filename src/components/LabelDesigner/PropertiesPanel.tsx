import React from 'react';
import {
    Box,
    Typography,
    TextField,
    Stack,
    Divider,
    Switch,
    FormControlLabel,
} from '@mui/material';
import { useLabelStore } from '../../stores/labelStore';
import {
    FormatAlignLeft,
    FormatAlignCenter,
    FormatAlignRight,
    FormatBold,
    FormatItalic,
} from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

export const PropertiesPanel: React.FC = () => {
    const { selectedElementId, elements, actions, activePrinter } =
        useLabelStore();

    const selectedElement = elements.find((el) => el.id === selectedElementId);

    // If no element selected, show Page Properties
    if (!selectedElement) {
        return (
            <Box sx={{ p: 0 }}>
                <SectionHeader title="IMPRESORA Y PÁGINA" />
                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Impresora Activa
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {activePrinter ? activePrinter.name : 'Ninguna'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Tamaño de Medio
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {activePrinter
                                    ? `${activePrinter.max_printable_width_mm} x ${activePrinter.max_media_width_mm} mm`
                                    : '-'}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Box className="flex-1 border border-blue-500 bg-blue-50 rounded p-2 text-center cursor-pointer">
                                <Typography
                                    variant="caption"
                                    color="primary"
                                    fontWeight="bold"
                                >
                                    Vertical
                                </Typography>
                            </Box>
                            <Box className="flex-1 border border-gray-200 rounded p-2 text-center cursor-pointer hover:bg-gray-50">
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Horizontal
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>
            </Box>
        );
    }

    const handleChange = (field: string, value: any) => {
        actions.updateElement(selectedElement.id, { [field]: value });
    };

    const handleStyleChange = (field: string, value: any) => {
        actions.updateElement(selectedElement.id, {
            style: { ...selectedElement.style, [field]: value },
        });
    };

    return (
        <Box sx={{ p: 0 }}>
            {/* Header */}
            <SectionHeader
                title={`PROPIEDADES - ${selectedElement.type.toUpperCase()}`}
            />

            <Box sx={{ p: 3 }}>
                <Stack spacing={4}>
                    {/* Position Section */}
                    <Box>
                        <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
                            sx={{ mb: 2, display: 'block' }}
                        >
                            POSICIÓN Y TAMAÑO
                        </Typography>
                        <div className="grid grid-cols-2 gap-3">
                            <PropInput
                                label="X (mm)"
                                value={Math.round(selectedElement.x)}
                                onChange={(v) => handleChange('x', Number(v))}
                            />
                            <PropInput
                                label="Y (mm)"
                                value={Math.round(selectedElement.y)}
                                onChange={(v) => handleChange('y', Number(v))}
                            />
                            <PropInput
                                label="Ancho"
                                value={Math.round(selectedElement.width)}
                                onChange={(v) =>
                                    handleChange('width', Number(v))
                                }
                            />
                            <PropInput
                                label="Alto"
                                value={Math.round(selectedElement.height)}
                                onChange={(v) =>
                                    handleChange('height', Number(v))
                                }
                            />
                        </div>
                    </Box>

                    <Divider />

                    {/* Appearance Section */}
                    {selectedElement.type === 'text' && (
                        <Box>
                            <Typography
                                variant="caption"
                                fontWeight="bold"
                                color="text.secondary"
                                sx={{ mb: 2, display: 'block' }}
                            >
                                APARIENCIA
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    label="Fuente"
                                    select
                                    SelectProps={{ native: true }}
                                    size="small"
                                    fullWidth
                                    value={
                                        selectedElement.style.fontFamily ||
                                        'Arial'
                                    }
                                    onChange={(e) =>
                                        handleStyleChange(
                                            'fontFamily',
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Times New Roman">
                                        Times New Roman
                                    </option>
                                    <option value="Courier New">
                                        Courier New
                                    </option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Tahoma">Tahoma</option>
                                    <option value="Trebuchet MS">
                                        Trebuchet MS
                                    </option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Inter">Inter</option>
                                </TextField>

                                <Stack direction="row" spacing={1}>
                                    <ToggleButtonGroup
                                        size="small"
                                        value={(() => {
                                            const formats = [];
                                            if (
                                                selectedElement.style
                                                    .fontWeight === 'bold'
                                            )
                                                formats.push('bold');
                                            if (
                                                selectedElement.style
                                                    .fontStyle === 'italic'
                                            )
                                                formats.push('italic');
                                            return formats;
                                        })()}
                                        onChange={(_, newFormats) => {
                                            handleStyleChange(
                                                'fontWeight',
                                                newFormats.includes('bold')
                                                    ? 'bold'
                                                    : 'normal'
                                            );
                                            handleStyleChange(
                                                'fontStyle',
                                                newFormats.includes('italic')
                                                    ? 'italic'
                                                    : 'normal'
                                            );
                                        }}
                                        aria-label="text formatting"
                                    >
                                        <ToggleButton
                                            value="bold"
                                            aria-label="bold"
                                        >
                                            <FormatBold fontSize="small" />
                                        </ToggleButton>
                                        <ToggleButton
                                            value="italic"
                                            aria-label="italic"
                                        >
                                            <FormatItalic fontSize="small" />
                                        </ToggleButton>
                                    </ToggleButtonGroup>

                                    <ToggleButtonGroup
                                        size="small"
                                        exclusive
                                        value={
                                            selectedElement.style.align ||
                                            'left'
                                        }
                                        onChange={(_, newAlign) => {
                                            if (newAlign)
                                                handleStyleChange(
                                                    'align',
                                                    newAlign
                                                );
                                        }}
                                        sx={{ flexGrow: 1 }}
                                        aria-label="text alignment"
                                    >
                                        <ToggleButton
                                            value="left"
                                            sx={{ flexGrow: 1 }}
                                        >
                                            <FormatAlignLeft fontSize="small" />
                                        </ToggleButton>
                                        <ToggleButton
                                            value="center"
                                            sx={{ flexGrow: 1 }}
                                        >
                                            <FormatAlignCenter fontSize="small" />
                                        </ToggleButton>
                                        <ToggleButton
                                            value="right"
                                            sx={{ flexGrow: 1 }}
                                        >
                                            <FormatAlignRight fontSize="small" />
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Stack>

                                <PropInput
                                    label="Tamaño (px)"
                                    value={selectedElement.style.fontSize}
                                    onChange={(v) =>
                                        handleStyleChange('fontSize', Number(v))
                                    }
                                />
                            </Stack>
                        </Box>
                    )}

                    <Divider />

                    {/* Data Binding */}
                    <Box>
                        <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
                            sx={{ mb: 2, display: 'block' }}
                        >
                            DATOS
                        </Typography>
                        <TextField
                            label="Contenido / Variable"
                            fullWidth
                            size="small"
                            multiline={selectedElement.type === 'text'}
                            rows={selectedElement.type === 'text' ? 3 : 1}
                            value={selectedElement.value}
                            onChange={(e) =>
                                handleChange('value', e.target.value)
                            }
                            helperText="Use {{variable}} para datos dinámicos"
                        />
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Box
        sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderBottom: '1px solid',
            borderColor: 'divider',
        }}
    >
        <Typography variant="caption" fontWeight="bold" color="text.secondary">
            {title}
        </Typography>
    </Box>
);

const PropInput: React.FC<{
    label: string;
    value: string | number;
    onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
    <TextField
        label={label}
        type="number"
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
    />
);
