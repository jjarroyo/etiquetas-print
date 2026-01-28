import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
    Divider,
    Container,
} from '@mui/material';
import {
    ArrowBack,
    Description,
    DesignServices,
    TableChart,
    Print,
    Help,
} from '@mui/icons-material';

// Import images (make sure these are in the correct path)
import designerImg from '../../assets/docs/designer-overview.png';
import importImg from '../../assets/docs/data-import.png';
import printingImg from '../../assets/docs/printing.png';

interface DocumentationProps {
    onBack: () => void;
}

type SectionId = 'intro' | 'designer' | 'data' | 'printing' | 'faq';

const SECTIONS = [
    { id: 'intro', label: 'Introducción', icon: <Description /> },
    { id: 'designer', label: 'Diseñador Visual', icon: <DesignServices /> },
    { id: 'data', label: 'Importación de Datos', icon: <TableChart /> },
    { id: 'printing', label: 'Impresión', icon: <Print /> },
    { id: 'faq', label: 'Preguntas Frecuentes', icon: <Help /> },
];

export const Documentation: React.FC<DocumentationProps> = ({ onBack }) => {
    const [activeSection, setActiveSection] = useState<SectionId>('intro');

    const renderContent = () => {
        switch (activeSection) {
            case 'intro':
                return (
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Bienvenido a Label Designer
                        </Typography>
                        <Typography paragraph color="text.secondary">
                            Esta aplicación te permite crear, gestionar e
                            imprimir etiquetas de manera eficiente. Puedes
                            diseñar tus etiquetas desde cero o utilizar
                            plantillas, e importar datos masivos desde Excel o
                            CSV.
                        </Typography>
                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                            Características Principales
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="🎨 Diseño Visual Intuitivo"
                                    secondary="Arrastra y suelta elementos como texto, códigos de barras e imágenes."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="📊 Importación de Datos"
                                    secondary="Carga bases de datos de productos o envíos desde Excel."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="🖨️ Impresión Masiva"
                                    secondary="Genera cientos de etiquetas automáticamente mapeando tus datos."
                                />
                            </ListItem>
                        </List>
                    </Box>
                );
            case 'designer':
                return (
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            El Diseñador Visual
                        </Typography>
                        <Typography paragraph color="text.secondary">
                            El corazón de la aplicación es el editor visual.
                            Aquí defines cómo se verán tus etiquetas.
                        </Typography>

                        <Paper
                            variant="outlined"
                            sx={{ p: 1, mb: 4, bgcolor: '#f1f5f9' }}
                        >
                            <img
                                src={designerImg}
                                alt="Designer Interface"
                                style={{ width: '100%', borderRadius: 8 }}
                            />
                            <Typography
                                variant="caption"
                                display="block"
                                align="center"
                                sx={{ mt: 1 }}
                            >
                                Interfaz del Diseñador
                            </Typography>
                        </Paper>

                        <Typography variant="h6" gutterBottom>
                            Herramientas
                        </Typography>
                        <Typography paragraph>
                            Usa la barra lateral izquierda para agregar
                            elementos:
                        </Typography>
                        <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                            <li>
                                <strong>Texto:</strong> Etiquetas fijas o
                                variables.
                            </li>
                            <li>
                                <strong>Código de Barras:</strong> Soporta
                                Code128, EAN, UPC, etc.
                            </li>
                            <li>
                                <strong>Imágenes:</strong> Logos o gráficos.
                            </li>
                            <li>
                                <strong>QR Code:</strong> Códigos 2D
                                escaneables.
                            </li>
                        </ul>

                        <Typography variant="h6" gutterBottom>
                            Propiedades
                        </Typography>
                        <Typography paragraph>
                            Al seleccionar un elemento, el panel derecho muestra
                            opciones para cambiar fuente, tamaño, alineación y
                            contenido.
                        </Typography>
                    </Box>
                );
            case 'data':
                return (
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Importación de Datos
                        </Typography>
                        <Typography paragraph color="text.secondary">
                            Automatiza la creación de etiquetas cargando tus
                            datos desde archivos externos.
                        </Typography>

                        <Paper
                            variant="outlined"
                            sx={{ p: 1, mb: 4, bgcolor: '#f1f5f9' }}
                        >
                            <img
                                src={importImg}
                                alt="Data Import"
                                style={{ width: '100%', borderRadius: 8 }}
                            />
                        </Paper>

                        <Typography variant="h6" gutterBottom>
                            Formatos Soportados
                        </Typography>
                        <Typography paragraph>
                            Puedes subir archivos <strong>.xlsx</strong> (Excel)
                            o <strong>.csv</strong>. Asegúrate de que la primera
                            fila contenga los encabezados (ej: Nombre, Precio,
                            SKU).
                        </Typography>

                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                            Mapeo de Variables
                        </Typography>
                        <Typography paragraph>
                            Una vez cargados los datos, podrás asignar las
                            columnas de tu Excel a los elementos de tu diseño.
                            Por ejemplo, conectar la columna "Precio" al
                            elemento de texto del precio en la etiqueta.
                        </Typography>
                    </Box>
                );
            case 'printing':
                return (
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Impresión y Exportación
                        </Typography>
                        <Typography paragraph color="text.secondary">
                            Visualiza tus etiquetas antes de imprimir y
                            configura tu impresora.
                        </Typography>

                        <Paper
                            variant="outlined"
                            sx={{ p: 1, mb: 4, bgcolor: '#f1f5f9' }}
                        >
                            <img
                                src={printingImg}
                                alt="Printing Dialog"
                                style={{ width: '100%', borderRadius: 8 }}
                            />
                        </Paper>

                        <Typography variant="h6" gutterBottom>
                            Vista Previa de Impresión
                        </Typography>
                        <Typography paragraph>
                            Verás una simulación de cómo quedarán todas las
                            etiquetas generadas con tus datos. Puedes navegar
                            entre las páginas para verificar la información.
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                            Selección de Impresora
                        </Typography>
                        <Typography paragraph>
                            Elige la impresora térmica o estándar que
                            utilizarás. La aplicación detectará las impresoras
                            instaladas en tu sistema.
                        </Typography>
                    </Box>
                );
            case 'faq':
                return (
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Preguntas Frecuentes
                        </Typography>

                        <Box sx={{ mt: 4 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                            >
                                ¿Mis datos se guardan en la nube?
                            </Typography>
                            <Typography
                                paragraph
                                color="text.secondary"
                                sx={{ mb: 4 }}
                            >
                                No, esta aplicación funciona localmente. Tus
                                diseños y datos se guardan en tu computadora.
                            </Typography>

                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                            >
                                ¿Puedo guardar mis diseños?
                            </Typography>
                            <Typography
                                paragraph
                                color="text.secondary"
                                sx={{ mb: 4 }}
                            >
                                Sí, puedes guardar tus plantillas para
                                reutilizarlas más tarde desde la pantalla de
                                Inicio.
                            </Typography>

                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                            >
                                ¿Qué hago si mi impresora no aparece?
                            </Typography>
                            <Typography paragraph color="text.secondary">
                                Asegúrate de que los drivers de tu impresora
                                estén instalados correctamente en Windows y que
                                la impresora esté encendida y conectada.
                            </Typography>
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                bgcolor: '#f8fafc',
                overflow: 'hidden',
            }}
        >
            {/* Sidebar */}
            <Paper
                elevation={0}
                sx={{
                    width: 280,
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 0,
                    bgcolor: 'white',
                    zIndex: 10,
                }}
            >
                <Box
                    sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    <Button
                        onClick={onBack}
                        startIcon={<ArrowBack />}
                        color="inherit"
                    >
                        Volver
                    </Button>
                </Box>
                <Divider />
                <List sx={{ flex: 1, pt: 2 }}>
                    {SECTIONS.map((section) => (
                        <ListItem key={section.id} disablePadding>
                            <ListItemButton
                                selected={activeSection === section.id}
                                onClick={() =>
                                    setActiveSection(section.id as SectionId)
                                }
                                sx={{
                                    mx: 1,
                                    borderRadius: 2,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        bgcolor: '#eff6ff',
                                        color: '#2563eb',
                                        '& .MuiListItemIcon-root': {
                                            color: '#2563eb',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{ minWidth: 40, color: '#64748b' }}
                                >
                                    {section.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={section.label}
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Content Area */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            borderRadius: 4,
                            minHeight: '100%',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        {renderContent()}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};
