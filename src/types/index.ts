export interface ExcelRow {
    [key: string]: string | number | boolean | null;
}

export interface ColumnMapping {
    excelColumn: string;
    labelField: string;
}

export interface LabelField {
    id: string;
    type: 'text' | 'barcode' | 'image' | 'shape';
    x: number;
    y: number;
    width: number;
    height: number;
    value: string; // Dynamic content (e.g., {{name}}) or static
    style: Record<string, any>;
}

export interface LabelTemplate {
    id: string;
    name: string;
    width: number; // mm
    height: number; // mm
    elements: LabelField[];
}
