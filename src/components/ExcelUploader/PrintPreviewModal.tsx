import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material';
import { Stage, Layer, Text, Image as KonvaImage } from 'react-konva';
import { LabelField } from '../../types';
import bwipjs from 'bwip-js';
import QRCode from 'qrcode';

interface PrintPreviewModalProps {
    open: boolean;
    onClose: () => void;
    onPrint: () => void;
    elements: LabelField[];
    width: number;
    height: number;
    previewData: any; // Data from the first row of Excel
    mapping: Record<string, string>; // Map: Element ID -> Excel Column
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
    open,
    onClose,
    onPrint,
    elements,
    width,
    height,
    previewData,
    mapping,
}) => {
    const mmToPx = 3.7795275591; // 1mm = 3.78px approx
    const scale = 1.5; // Zoom for preview

    // Helper to resolve value based on mapping
    const resolveValue = (element: LabelField) => {
        const mappedCol = mapping[element.id];
        if (mappedCol && previewData) {
            return previewData[mappedCol] !== undefined
                ? String(previewData[mappedCol])
                : element.value;
        }
        return element.value;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Vista Previa de Impresión</DialogTitle>
            <DialogContent dividers>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        minHeight: 300,
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5',
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            boxShadow: 3,
                            bgcolor: 'white',
                            width: width * mmToPx * scale,
                            height: height * mmToPx * scale,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Stage
                            width={width * mmToPx * scale}
                            height={height * mmToPx * scale}
                            scale={{ x: scale, y: scale }}
                        >
                            <Layer>
                                {elements.map((el) => {
                                    const value = resolveValue(el);
                                    if (el.type === 'text') {
                                        return (
                                            <Text
                                                key={el.id}
                                                x={el.x * mmToPx}
                                                y={el.y * mmToPx}
                                                width={el.width * mmToPx}
                                                height={el.height * mmToPx}
                                                text={value}
                                                fontSize={el.style.fontSize}
                                                fontFamily={el.style.fontFamily}
                                                fontStyle={
                                                    el.style.fontWeight ===
                                                    'bold'
                                                        ? 'bold'
                                                        : el.style.fontStyle ===
                                                            'italic'
                                                          ? 'italic'
                                                          : 'normal'
                                                }
                                                align={el.style.align}
                                                fill={el.style.fill}
                                            />
                                        );
                                    } else if (el.type === 'barcode') {
                                        return (
                                            <BarcodePreview
                                                key={el.id}
                                                element={{ ...el, value }}
                                                mmToPx={mmToPx}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </Layer>
                        </Stage>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        Mostrando datos de la primera fila detectada (Fila 1)
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancelar
                </Button>
                <Button onClick={onPrint} variant="contained" color="primary">
                    Imprimir Todo
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Simplified Barcode/QR Component for Preview
const BarcodePreview: React.FC<{
    element: LabelField;
    mmToPx: number;
}> = ({ element, mmToPx }) => {
    const [image, setImage] = React.useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const generate = async () => {
            try {
                const canvas = document.createElement('canvas');
                if (element.style.barcodeType === 'qrcode') {
                    await QRCode.toCanvas(canvas, element.value, {
                        width: element.width * mmToPx,
                        margin: 0,
                    });
                } else {
                    bwipjs.toCanvas(canvas, {
                        bcid: element.style.barcodeType || 'code128',
                        text: element.value,
                        scale: 3,
                        height: 10,
                        includetext: true,
                        textxalign: 'center',
                    });
                }
                const img = new window.Image();
                img.src = canvas.toDataURL();
                setImage(img);
            } catch (e) {
                console.error('Preview barcode error:', e);
            }
        };
        generate();
    }, [element.value, element.style.barcodeType, element.width, mmToPx]);

    if (!image) return null;

    return (
        <KonvaImage
            x={element.x * mmToPx}
            y={element.y * mmToPx}
            width={element.width * mmToPx}
            height={element.height * mmToPx}
            image={image}
        />
    );
};
