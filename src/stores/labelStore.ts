import { create } from 'zustand';
import { LabelField } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Printer } from '../services/db';

interface LabelState {
    width: number; // mm
    height: number; // mm
    zoom: number;
    elements: LabelField[];
    selectedElementId: string | null;
    activePrinter: Printer | null;
    currentDesign: { id: number; name: string } | null;
    actions: {
        setSize: (width: number, height: number) => void;
        setZoom: (zoom: number) => void;
        addElement: (type: LabelField['type'] | 'qr') => void;
        updateElement: (id: string, updates: Partial<LabelField>) => void;
        removeElement: (id: string) => void;
        selectElement: (id: string | null) => void;
        resizeAndCenter: (width: number, height: number) => void;
        setActivePrinter: (printer: Printer | null) => void;
        loadDesign: (id: number, name: string, elements: LabelField[]) => void;
        setCurrentDesign: (design: { id: number; name: string } | null) => void;
    };
}

export const useLabelStore = create<LabelState>((set) => ({
    width: 101.6, // 4 inches default
    height: 50.8, // 2 inches default
    zoom: 1,
    elements: [
        {
            id: 'default-text',
            type: 'text',
            x: 25.8, // Centered roughly (101.6 - 50) / 2
            y: 5,
            width: 50,
            height: 10,
            value: 'Producto Ejemplo',
            style: {
                fontSize: 14,
                fontFamily: 'Arial',
                fill: '#000000',
                align: 'center',
                fontWeight: 'bold',
            },
        },
        {
            id: 'default-barcode',
            type: 'barcode',
            x: 25.8, // Centered roughly (101.6 - 50) / 2
            y: 20,
            width: 50,
            height: 25,
            value: '12345678',
            style: { fill: '#000000', fontSize: 12, barcodeType: 'code128' },
        },
    ],
    selectedElementId: null,
    activePrinter: null,
    currentDesign: null,
    actions: {
        setSize: (width, height) => set({ width, height }),
        setZoom: (zoom) => set({ zoom }),
        addElement: (inputType: LabelField['type'] | 'qr') =>
            set((state) => {
                const isQR = inputType === 'qr';
                const type = isQR ? 'barcode' : inputType;

                const style = {
                    fontSize: 14,
                    fill: '#000000',
                    ...(type === 'barcode'
                        ? {
                              barcodeType: isQR ? 'qrcode' : 'code128',
                              fontSize: 12,
                          }
                        : {}),
                };

                const newElement: LabelField = {
                    id: uuidv4(),
                    type: type as LabelField['type'],
                    x: 10,
                    y: 10,
                    width: isQR ? 30 : 50,
                    height: isQR ? 30 : 20,
                    value: type === 'text' ? 'Texto' : '123456',
                    style,
                };
                return {
                    elements: [...state.elements, newElement],
                    selectedElementId: newElement.id,
                };
            }),
        updateElement: (id, updates) =>
            set((state) => ({
                elements: state.elements.map((el) =>
                    el.id === id ? { ...el, ...updates } : el
                ),
            })),
        removeElement: (id) =>
            set((state) => ({
                elements: state.elements.filter((el) => el.id !== id),
                selectedElementId:
                    state.selectedElementId === id
                        ? null
                        : state.selectedElementId,
            })),
        selectElement: (id) => set({ selectedElementId: id }),
        resizeAndCenter: (width, height) =>
            set((state) => ({
                width,
                height,
                elements: state.elements.map((el) => ({
                    ...el,
                    x: (width - el.width) / 2,
                })),
            })),
        setActivePrinter: (printer) => set({ activePrinter: printer }),
        loadDesign: (id, name, elements) =>
            set({
                currentDesign: { id, name },
                elements,
                selectedElementId: null,
            }),
        setCurrentDesign: (design) => set({ currentDesign: design }),
    },
}));
