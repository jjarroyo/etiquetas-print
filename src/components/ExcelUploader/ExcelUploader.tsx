import React, { useCallback, useState } from 'react';
import { useExcelStore } from '../../stores/excelStore';
import { parseExcelFile } from '../../utils/excelParser';
import {
    CloudUpload,
    TableChart,
    CheckCircle,
    Warning,
    Link as LinkIcon,
    Description,
    KeyboardArrowRight,
    Search,
    ArrowBack,
    Print,
} from '@mui/icons-material';
import {
    IconButton,
    Box,
    Paper,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
} from '@mui/material';
import { getDesigns, getPrinters } from '../../services/db';
import { invoke } from '@tauri-apps/api/core';
import { PrintPreviewModal } from './PrintPreviewModal';
import { generatePDF } from '../../services/pdfGenerator';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

interface ExcelUploaderProps {
    onBack?: () => void;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onBack }) => {
    const { data, columns, setExcelData, clearData } = useExcelStore();
    const [isDragOver, setIsDragOver] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [templateElements, setTemplateElements] = useState<any[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [printers, setPrinters] = useState<any[]>([]);
    const [activePrinter, setActivePrinter] = useState<any | null>(null);
    const [openPreview, setOpenPreview] = useState(false);
    const [printProgress, setPrintProgress] = useState(0);

    // PDF Export State
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const [pdfColumns, setPdfColumns] = useState(1);
    const [isExporting, setIsExporting] = useState(false);

    // Navigation Confirm State
    const [confirmExitOpen, setConfirmExitOpen] = useState(false);

    // Clear data on mount
    React.useEffect(() => {
        clearData();
    }, [clearData]);

    // Fetch initial data
    React.useEffect(() => {
        const load = async () => {
            const [d, p] = await Promise.all([getDesigns(), getPrinters()]);
            setTemplates(d as any[]);
            setPrinters(p);
        };
        load();
    }, []);

    const handleBack = () => {
        if (data.length > 0) {
            setConfirmExitOpen(true);
        } else {
            if (onBack) onBack();
        }
    };

    const confirmExit = () => {
        clearData();
        setConfirmExitOpen(false);
        if (onBack) onBack();
    };

    const handleFileUpload = useCallback(
        async (file: File) => {
            try {
                const jsonData = await parseExcelFile(file);
                setExcelData(jsonData, file.name);
            } catch (error) {
                console.error('Error parsing Excel file:', error);
            }
        },
        [setExcelData]
    );

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    const handleTemplateChange = (e: any) => {
        const templateId = e.target.value;
        const template = templates.find((t) => t.id === templateId);
        setSelectedTemplate(template);
        if (template) {
            try {
                const elements = JSON.parse(template.content);
                setTemplateElements(elements);
                // Reset mapping
                setMapping({});
            } catch (err) {
                console.error('Error parsing template:', err);
            }
        }
    };

    const handleMappingChange = (elementId: string, column: string) => {
        setMapping((prev) => ({ ...prev, [elementId]: column }));
    };

    const handlePrintAll = async () => {
        if (!activePrinter || !selectedTemplate) return;

        try {
            // Iterate all rows
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                // Clone elements and resolve mapped values
                const printElements = templateElements.map((el: any) => {
                    const mappedCol = mapping[el.id];
                    let value = el.value; // Default
                    if (mappedCol && row[mappedCol] !== undefined) {
                        value = String(row[mappedCol]);
                    }
                    return { ...el, value };
                });

                await invoke('print_label', {
                    printerName: activePrinter.name,
                    data: JSON.stringify(printElements),
                });
                setPrintProgress(((i + 1) / data.length) * 100);
            }
            alert('Impresión completada');
            setPrintProgress(0);
            setOpenPreview(false);
        } catch (error) {
            console.error('Batch Print Error:', error);
            alert('Error al imprimir');
        }
    };

    // Common Dialogs (Confirm Exit)
    const ConfirmExitDialog = (
        <Dialog
            open={confirmExitOpen}
            onClose={() => setConfirmExitOpen(false)}
        >
            <DialogTitle>¿Estás seguro de salir?</DialogTitle>
            <DialogContent>
                <Typography>
                    Se perderán los datos cargados actualmente.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setConfirmExitOpen(false)}>
                    Cancelar
                </Button>
                <Button onClick={confirmExit} color="error" variant="contained">
                    Salir y Limpiar
                </Button>
            </DialogActions>
        </Dialog>
    );

    if (data.length === 0) {
        return (
            <div className="min-h-[600px] flex flex-col items-center justify-center p-8 bg-gray-50 relative">
                <div className="absolute top-4 left-4">
                    <IconButton onClick={onBack}>
                        <ArrowBack />
                    </IconButton>
                </div>
                <div
                    className={`
                        w-full max-w-2xl p-12 rounded-3xl border-2 border-dashed transition-all duration-300
                        flex flex-col items-center justify-center cursor-pointer bg-white
                        ${isDragOver ? 'border-blue-500 bg-blue-50 scale-102 shadow-xl' : 'border-gray-300 hover:border-gray-400 hover:shadow-lg'}
                    `}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={() => setIsDragOver(false)}
                >
                    <input
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        id="excel-upload-input"
                        type="file"
                        onChange={onFileChange}
                    />
                    <label
                        htmlFor="excel-upload-input"
                        className="w-full flex flex-col items-center cursor-pointer"
                    >
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <CloudUpload
                                className="text-blue-600 text-5xl"
                                fontSize="inherit"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-3">
                            Sube tu archivo Excel
                        </h2>
                        <p className="text-gray-500 text-lg mb-8 text-center max-w-md">
                            Arrastra y suelta tu archivo aquí, o haz clic para
                            explorar. Soportamos .xlsx y .csv
                        </p>
                        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-200">
                            Explorar Archivos
                        </button>
                    </label>
                </div>
            </div>
        );
    }

    // Stats Calculations
    const totalRows = data.length;
    const detectedColumns = columns.length;
    const mappedCount = Object.keys(mapping).filter((k) => mapping[k]).length;
    const totalFields = templateElements.filter(
        (el) => el.type === 'text' || el.type === 'barcode'
    ).length;
    const isReady = selectedTemplate && activePrinter && mappedCount > 0;

    return (
        <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
            {ConfirmExitDialog}
            <div className="flex-1 flex flex-col p-6 min-h-0">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                            <IconButton
                                onClick={handleBack}
                                size="small"
                                sx={{ mr: 1, p: 0.5 }}
                            >
                                <ArrowBack fontSize="small" />
                            </IconButton>
                            <span
                                className="cursor-pointer hover:text-blue-600"
                                onClick={handleBack}
                            >
                                Inicio
                            </span>
                            <KeyboardArrowRight fontSize="small" />
                            <span className="font-semibold text-gray-800">
                                Análisis de Datos
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <label
                            htmlFor="upload-new"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm shadow-blue-200 transition-all text-sm cursor-pointer flex items-center gap-2"
                        >
                            <CloudUpload fontSize="small" />
                            Subir Nuevo Archivo
                        </label>
                        <input
                            id="upload-new"
                            type="file"
                            className="hidden"
                            onChange={onFileChange}
                            accept=".xlsx,.csv"
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<TableChart className="text-blue-600" />}
                        label="Total Filas"
                        value={totalRows.toLocaleString()}
                        bg="bg-blue-50"
                    />
                    <StatCard
                        icon={<Description className="text-purple-600" />}
                        label="Columnas"
                        value={detectedColumns.toString()}
                        bg="bg-purple-50"
                    />
                    <StatCard
                        icon={<LinkIcon className="text-green-600" />}
                        label="Mapeados"
                        value={`${mappedCount} / ${totalFields}`}
                        bg="bg-green-50"
                    />
                    <StatCard
                        icon={
                            isReady ? (
                                <CheckCircle className="text-teal-600" />
                            ) : (
                                <Warning className="text-orange-600" />
                            )
                        }
                        label="Estado"
                        value={isReady ? 'Listo' : 'Configurar'}
                        bg={isReady ? 'bg-teal-50' : 'bg-orange-50'}
                    />
                </div>

                {/* Layout: Data Table (Left) + Config (Right) */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2">
                    {/* Left: Data Table */}
                    <div className="lg:col-span-2 h-full min-h-0">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">
                                    Datos Detectados ({totalRows})
                                </h3>
                            </div>
                            <div className="overflow-auto flex-1">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-3">#</th>
                                            {columns.map((c) => (
                                                <th
                                                    key={c}
                                                    className="p-3 min-w-[100px]"
                                                >
                                                    {c}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.slice(0, 50).map((row, i) => (
                                            <tr
                                                key={i}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="p-3 text-gray-400 text-xs">
                                                    {i + 1}
                                                </td>
                                                {columns.map((c) => (
                                                    <td
                                                        key={c}
                                                        className="p-3 text-gray-700"
                                                    >
                                                        {row[c]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: Configuration Sidebar */}
                    <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto pr-2">
                        {/* Template Selection */}
                        <Paper
                            sx={{ p: 3, borderRadius: 4 }}
                            elevation={0}
                            className="border border-gray-200"
                        >
                            <h3 className="font-bold text-gray-800 mb-4 ">
                                Configuración de Impresión
                            </h3>
                            <Stack spacing={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>
                                        Seleccionar Plantilla
                                    </InputLabel>
                                    <Select
                                        label="Seleccionar Plantilla"
                                        value={selectedTemplate?.id || ''}
                                        onChange={handleTemplateChange}
                                    >
                                        {templates.map((t) => (
                                            <MenuItem key={t.id} value={t.id}>
                                                {t.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel>Impresora</InputLabel>
                                    <Select
                                        label="Impresora"
                                        value={activePrinter?.id || ''}
                                        onChange={(e) => {
                                            const p = printers.find(
                                                (p) => p.id === e.target.value
                                            );
                                            setActivePrinter(p);
                                        }}
                                    >
                                        {printers.map((p) => (
                                            <MenuItem key={p.id} value={p.id}>
                                                {p.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<PictureAsPdf />}
                                        disabled={!selectedTemplate}
                                        onClick={() => setPdfDialogOpen(true)}
                                        sx={{
                                            py: 1.5,
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            borderRadius: 2,
                                        }}
                                    >
                                        Exportar PDF
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Print />}
                                        disabled={
                                            !selectedTemplate || !activePrinter
                                        }
                                        onClick={() => setOpenPreview(true)}
                                        sx={{
                                            py: 1.5,
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            borderRadius: 2,
                                        }}
                                    >
                                        Imprimir
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>

                        {/* PDF Export Dialog */}
                        <Dialog
                            open={pdfDialogOpen}
                            onClose={() => setPdfDialogOpen(false)}
                            maxWidth="xs"
                            fullWidth
                        >
                            <DialogTitle>
                                Opciones de Exportación PDF
                            </DialogTitle>
                            <DialogContent>
                                <Box sx={{ pt: 1 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        paragraph
                                    >
                                        Configura la distribución de las
                                        etiquetas en el PDF. Útil para
                                        impresoras que imprimen múltiples
                                        etiquetas por fila.
                                    </Typography>
                                    <TextField
                                        label="Columnas por Fila"
                                        type="number"
                                        fullWidth
                                        value={pdfColumns}
                                        onChange={(e) =>
                                            setPdfColumns(
                                                Math.max(
                                                    1,
                                                    parseInt(e.target.value) ||
                                                        1
                                                )
                                            )
                                        }
                                        InputProps={{
                                            inputProps: { min: 1, max: 10 },
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    Etiquetas
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setPdfDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={async () => {
                                        if (!selectedTemplate) return;
                                        setIsExporting(true);
                                        try {
                                            const pdfData = await generatePDF(
                                                data,
                                                templateElements,
                                                mapping,
                                                selectedTemplate.width,
                                                selectedTemplate.height,
                                                {
                                                    columns: pdfColumns,
                                                    columnGap: 2, // 2mm default gap
                                                    rowGap: 0,
                                                }
                                            );

                                            const path = await save({
                                                filters: [
                                                    {
                                                        name: 'PDF',
                                                        extensions: ['pdf'],
                                                    },
                                                ],
                                                defaultPath: 'etiquetas.pdf',
                                            });

                                            if (path) {
                                                await writeFile(path, pdfData);
                                                alert(
                                                    'PDF Guardado Correctamente'
                                                );
                                            }

                                            setPdfDialogOpen(false);
                                        } catch (e) {
                                            console.error(e);
                                            alert(
                                                'Error al generar PDF: ' +
                                                    String(e)
                                            );
                                        } finally {
                                            setIsExporting(false);
                                        }
                                    }}
                                    disabled={isExporting}
                                >
                                    {isExporting
                                        ? 'Generando...'
                                        : 'Descargar PDF'}
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Field Mapping */}
                        {selectedTemplate && (
                            <Paper
                                sx={{
                                    p: 0,
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                }}
                                elevation={0}
                                className="border border-gray-200"
                            >
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 text-sm uppercase">
                                        Mapeo de Campos
                                    </h3>
                                    <Tooltip title="Asocia las columnas de tu Excel a los elementos del diseño">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold cursor-help">
                                            ?
                                        </div>
                                    </Tooltip>
                                </div>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                Campo en Diseño
                                            </TableCell>
                                            <TableCell>Columna Excel</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {templateElements.map((el) => {
                                            if (
                                                el.type !== 'text' &&
                                                el.type !== 'barcode'
                                            )
                                                return null;
                                            return (
                                                <TableRow key={el.id}>
                                                    <TableCell
                                                        sx={{
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        <div className="font-medium text-gray-700">
                                                            {el.value}
                                                        </div>
                                                        <div className="text-xs text-gray-400 capitalize">
                                                            {el.type}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            variant="standard"
                                                            disableUnderline
                                                            fullWidth
                                                            value={
                                                                mapping[
                                                                    el.id
                                                                ] || ''
                                                            }
                                                            onChange={(e) =>
                                                                handleMappingChange(
                                                                    el.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            displayEmpty
                                                            sx={{
                                                                fontSize:
                                                                    '0.85rem',
                                                            }}
                                                        >
                                                            <MenuItem value="">
                                                                <em className="text-gray-400">
                                                                    Sin Mapear
                                                                </em>
                                                            </MenuItem>
                                                            {columns.map(
                                                                (col) => (
                                                                    <MenuItem
                                                                        key={
                                                                            col
                                                                        }
                                                                        value={
                                                                            col
                                                                        }
                                                                    >
                                                                        {col}
                                                                    </MenuItem>
                                                                )
                                                            )}
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Paper>
                        )}
                    </div>
                </div>

                {/* Print Preview Modal */}
                {selectedTemplate && (
                    <PrintPreviewModal
                        open={openPreview}
                        onClose={() => setOpenPreview(false)}
                        onPrint={handlePrintAll}
                        elements={templateElements}
                        width={selectedTemplate.width || 100} // Default or fetched width
                        height={selectedTemplate.height || 50}
                        previewData={data.length > 0 ? data[0] : {}}
                        mapping={mapping}
                    />
                )}

                {/* Progress Overlay */}
                {printProgress > 0 && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                        <Paper sx={{ p: 4, textAlign: 'center', width: 300 }}>
                            <Typography variant="h6" gutterBottom>
                                Imprimiendo...
                            </Typography>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${printProgress}%` }}
                                ></div>
                            </div>
                            <Typography variant="caption">
                                {Math.round(printProgress)}% Completado
                            </Typography>
                        </Paper>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Component for Stats
const StatCard = ({
    icon,
    label,
    value,
    bg,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    bg: string;
}) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}
        >
            {icon}
        </div>
        <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {label}
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
    </div>
);
