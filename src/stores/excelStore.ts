import { create } from 'zustand';
import { ExcelRow } from '../types';

interface ExcelState {
    data: ExcelRow[];
    columns: string[];
    fileName: string | null;
    setExcelData: (data: ExcelRow[], fileName: string) => void;
    clearData: () => void;
}

export const useExcelStore = create<ExcelState>((set) => ({
    data: [],
    columns: [],
    fileName: null,
    setExcelData: (data, fileName) => {
        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        set({ data, columns, fileName });
    },
    clearData: () => set({ data: [], columns: [], fileName: null }),
}));
