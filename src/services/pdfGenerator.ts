import { jsPDF } from 'jspdf';
import bwipjs from 'bwip-js';
import QRCode from 'qrcode';
import { LabelField } from '../types';

interface PDFGeneratorOptions {
    columns: number;
    columnGap: number; // in mm
    rowGap: number; // in mm
    pageWidth?: number; // Auto-calculate if not provided
    pageHeight?: number; // Auto-calculate if not provided
}

export const generatePDF = async (
    data: any[],
    templateElements: LabelField[],
    mapping: Record<string, string>,
    labelWidth: number, // mm
    labelHeight: number, // mm
    options: PDFGeneratorOptions
) => {
    console.log('Generating PDF...', {
        dataLength: data.length,
        labelWidth,
        labelHeight,
        options,
    });

    try {
        // 1. Calculate Grid
        const { columns, columnGap, rowGap } = options;

        const safeWidth = Number(labelWidth) || 100;
        const safeHeight = Number(labelHeight) || 50;
        const safeColumns = Number(columns) || 1;
        const safeColGap = Number(columnGap) || 0;

        const rowWidth =
            safeWidth * safeColumns + safeColGap * (safeColumns - 1);
        const rowHeight = safeHeight; // Height of one row

        console.log('PDF Layout:', { rowWidth, rowHeight, safeColumns });

        // Initialize jsPDF
        // Note: new jsPDF() might fail if imports are wrong in some envs.
        // We use { jsPDF } named import which matches @types/jspdf v2+
        const doc = new jsPDF({
            orientation: rowWidth > rowHeight ? 'l' : 'p',
            unit: 'mm',
            format: [rowWidth, rowHeight],
        });

        let currentRowData: any[] = [];

        for (let i = 0; i < data.length; i++) {
            currentRowData.push(data[i]);

            // If row is full or last item, process the row
            if (
                currentRowData.length === safeColumns ||
                i === data.length - 1
            ) {
                // Add page if this is NOT the very first row
                // The document starts with 1 page created in constructor.
                // So if i > (columns - 1) we need a new page?
                // Actually:
                // If columns=1, i=0. processed. No new page needed (use first page).
                // If columns=1, i=1. New page needed.
                // Logic: If we are processing a chunk and it's NOT the first chunk, add page.
                const isFirstChunk = i < safeColumns;
                if (!isFirstChunk) {
                    doc.addPage([rowWidth, rowHeight]);
                }

                for (let j = 0; j < currentRowData.length; j++) {
                    const item = currentRowData[j];
                    const offsetX = j * (safeWidth + safeColGap);
                    const offsetY = 0;

                    await renderLabelOnPDF(
                        doc,
                        templateElements,
                        mapping,
                        item,
                        offsetX,
                        offsetY
                    );
                }
                currentRowData = [];
            }
        }

        // Return Uint8Array instead of saving directly in browser
        const pdfOutput = doc.output('arraybuffer');
        console.log('PDF Generated, size:', pdfOutput.byteLength);
        return new Uint8Array(pdfOutput);
    } catch (error) {
        console.error('PDF Generation Fatal Error:', error);
        throw error;
    }
};

const renderLabelOnPDF = async (
    doc: jsPDF,
    elements: LabelField[],
    mapping: Record<string, string>,
    row: any,
    offsetX: number,
    offsetY: number
) => {
    // Resolve Mapping
    const resolveValue = (el: LabelField) => {
        const mappedCol = mapping[el.id];
        if (mappedCol && row[mappedCol] !== undefined) {
            return String(row[mappedCol]);
        }
        return el.value;
    };

    for (const el of elements) {
        try {
            const value = resolveValue(el);
            const x = offsetX + el.x;
            const y = offsetY + el.y;

            if (el.type === 'text') {
                const fontSize = el.style.fontSize || 12;
                const isBold = el.style.fontWeight === 'bold';
                const isItalic = el.style.fontStyle === 'italic';

                doc.setFontSize(fontSize);
                doc.setFont(
                    'helvetica',
                    isBold && isItalic
                        ? 'bolditalic'
                        : isBold
                          ? 'bold'
                          : isItalic
                            ? 'italic'
                            : 'normal'
                );
                doc.setTextColor(el.style.fill || '#000000');

                // Text alignment logic could be complex in pure PDF
                // Simple left align for now, or approximate center
                const text = String(value);
                doc.text(text, x, y + fontSize * 0.35);
            } else if (el.type === 'barcode') {
                const canvas = document.createElement('canvas');

                if (el.style.barcodeType === 'qrcode') {
                    await QRCode.toCanvas(canvas, String(value), {
                        width: el.width * 4, // Higher res for PDF
                        margin: 0,
                    });
                } else {
                    bwipjs.toCanvas(canvas, {
                        bcid: el.style.barcodeType || 'code128',
                        text: String(value),
                        scale: 3,
                        height: 10,
                        includetext: true,
                    });
                }

                const imgData = canvas.toDataURL('image/png');
                if (imgData && imgData.length > 50) {
                    doc.addImage(imgData, 'PNG', x, y, el.width, el.height);
                }
            }
        } catch (elError) {
            console.error('Error rendering element:', el, elError);
        }
    }
};
