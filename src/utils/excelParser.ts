import * as XLSX from 'xlsx';
import { ExcelRow } from '../types';

export const parseExcelFile = async (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // 1. Convert sheet to 2D array (header: 1 means array of arrays)
                const rawData = XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    defval: '',
                }) as any[][];

                if (rawData.length === 0) {
                    resolve([]);
                    return;
                }

                // 2. Smart Header Detection
                // Scan first 20 rows to find the best candidate for header
                let headerRowIndex = 0;
                let maxNonEmptyCols = 0;

                // Limit check to first 20 rows or total rows if less
                const rowsToCheck = Math.min(rawData.length, 20);

                for (let i = 0; i < rowsToCheck; i++) {
                    const row = rawData[i];
                    // Count non-empty, non-numeric strings
                    const nonEmptyCount = row.filter(
                        (cell) =>
                            cell !== undefined &&
                            cell !== null &&
                            cell !== '' &&
                            typeof cell === 'string'
                    ).length;

                    if (nonEmptyCount > maxNonEmptyCols) {
                        maxNonEmptyCols = nonEmptyCount;
                        headerRowIndex = i;
                    }
                }

                console.log(
                    `Detected header at row ${headerRowIndex} with ${maxNonEmptyCols} columns`
                );

                // 3. Extract Headers and Data
                const headers = rawData[headerRowIndex].map(String);
                const finalData: ExcelRow[] = [];

                for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                    const row = rawData[i];
                    // Skip completely empty rows
                    if (
                        row.every(
                            (cell) =>
                                cell === undefined ||
                                cell === null ||
                                cell === ''
                        )
                    ) {
                        continue;
                    }

                    const rowObj: ExcelRow = {};
                    headers.forEach((header, index) => {
                        // Ensure header is not empty string
                        if (header && header.trim() !== '') {
                            rowObj[header] = row[index];
                        }
                    });
                    finalData.push(rowObj);
                }

                resolve(finalData);
            } catch (error) {
                console.error('Error parsing excel:', error);
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

export const getColumnNames = (data: ExcelRow[]): string[] => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
};
