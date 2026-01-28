import React from 'react';
import { IconButton, Tooltip, Stack } from '@mui/material';
import {
    TextFields,
    Image,
    CropSquare,
    QrCode,
    ViewColumn, // Barcode-like
    NearMe, // Select cursor-like
} from '@mui/icons-material';
import { useLabelStore } from '../../stores/labelStore';

export const Toolbar: React.FC = () => {
    const { actions, selectedElementId } = useLabelStore();

    const tools = [
        {
            id: 'select',
            icon: <NearMe sx={{ transform: 'rotate(-45deg)' }} />,
            label: 'Seleccionar',
            action: () => actions.selectElement(null),
        },
        {
            id: 'text',
            icon: <TextFields />,
            label: 'Texto',
            action: () => actions.addElement('text'),
        },
        {
            id: 'barcode',
            icon: <ViewColumn sx={{ transform: 'rotate(90deg)' }} />,
            label: 'Código de Barras',
            action: () => actions.addElement('barcode'),
        },
        {
            id: 'qr',
            icon: <QrCode />,
            label: 'Código QR',
            action: () => actions.addElement('qr'),
        },
        {
            id: 'shape',
            icon: <CropSquare />,
            label: 'Forma',
            action: () => actions.addElement('shape'),
        },
        {
            id: 'image',
            icon: <Image />,
            label: 'Imagen',
            action: () => actions.addElement('image'),
        },
    ];

    return (
        <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
            {tools.map((tool) => (
                <Tooltip key={tool.id} title={tool.label} placement="right">
                    <IconButton
                        onClick={tool.action}
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            bgcolor: 'transparent',
                            color: 'text.secondary',
                            '&:hover': {
                                bgcolor: 'primary.50',
                                color: 'primary.main',
                            },
                            // Active state logic could be added here
                        }}
                    >
                        {tool.icon}
                    </IconButton>
                </Tooltip>
            ))}
        </Stack>
    );
};
