import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
    Stage,
    Layer,
    Rect,
    Text,
    Image as KonvaImage,
    Transformer,
    Group,
} from 'react-konva';
import { useLabelStore } from '../../stores/labelStore';
import Konva from 'konva';
import bwipjs from 'bwip-js';
import QRCode from 'qrcode';

// Helper component to render Barcodes using Konva Image
const BarcodeNode = ({ element, isSelected, onClick, onDragEnd }: any) => {
    const [image, setImage] = useState<HTMLCanvasElement | null>(null);
    const mmToPx = 3.7795275591;

    useEffect(() => {
        try {
            const canvas = document.createElement('canvas');
            // Basic approximation: 1 unit width ~ 2px for decent resolution
            bwipjs.toCanvas(canvas, {
                bcid: 'code128', // Barcode type
                text: element.value || '123456', // Text to encode
                scale: 3, // 3x scaling factor
                height: 10, // Bar height, in millimeters
                includetext: true, // Show human-readable text
                textxalign: 'center', // Always good to align text
            });
            setImage(canvas);
        } catch (e) {
            console.error('Barcode render error:', e);
        }
    }, [element.value]);

    return (
        <React.Fragment>
            {image && (
                <KonvaImage
                    id={element.id}
                    x={element.x * mmToPx}
                    y={element.y * mmToPx}
                    width={element.width * mmToPx}
                    height={element.height * mmToPx}
                    image={image}
                    draggable
                    onClick={onClick}
                    onTap={onClick}
                    onDragEnd={onDragEnd}
                />
            )}
        </React.Fragment>
    );
};

// Helper component for QR Codes
const QRCodeNode = ({ element, isSelected, onClick, onDragEnd }: any) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const mmToPx = 3.7795275591;

    useEffect(() => {
        QRCode.toDataURL(element.value || 'https://example.com')
            .then((url) => {
                const img = new window.Image();
                img.src = url;
                img.onload = () => setImage(img);
            })
            .catch((err) => console.error(err));
    }, [element.value]);

    return (
        <React.Fragment>
            {image && (
                <KonvaImage
                    id={element.id}
                    x={element.x * mmToPx}
                    y={element.y * mmToPx}
                    width={element.width * mmToPx} // QRs are square usually
                    height={element.height * mmToPx}
                    image={image}
                    draggable
                    onClick={onClick}
                    onTap={onClick}
                    onDragEnd={onDragEnd}
                />
            )}
        </React.Fragment>
    );
};

export const CanvasEditor: React.FC = () => {
    const { width, height, elements, selectedElementId, actions, zoom } =
        useLabelStore();
    const trRef = useRef<Konva.Transformer>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const mmToPx = 3.7795275591;

    // Handle Selection Transformer
    useEffect(() => {
        if (trRef.current && selectedElementId) {
            const node = stageRef.current?.findOne('#' + selectedElementId);
            if (node) {
                trRef.current.nodes([node]);
                trRef.current.getLayer()?.batchDraw();
            }
        } else {
            trRef.current?.nodes([]);
        }
    }, [selectedElementId, elements]);

    // Handle Delete Key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if user is typing in an input
            const activeTag = document.activeElement?.tagName.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea') return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedElementId) {
                    actions.removeElement(selectedElementId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementId, actions]);

    const handleSelect = (id: string | null) => {
        actions.selectElement(id);
    };

    const handleDragEnd = (
        id: string,
        e: Konva.KonvaEventObject<DragEvent>
    ) => {
        actions.updateElement(id, {
            x: e.target.x() / mmToPx,
            y: e.target.y() / mmToPx,
        });
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // padding: '40px'
            }}
            onClick={(e) => {
                if (e.target === containerRef.current) {
                    handleSelect(null);
                }
            }}
        >
            <Stage
                width={width * mmToPx * zoom}
                height={height * mmToPx * zoom}
                scale={{ x: zoom, y: zoom }}
                style={{
                    backgroundColor: 'white',
                    boxShadow:
                        '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
                onMouseDown={(e) => {
                    if (e.target === e.target.getStage()) {
                        handleSelect(null);
                    }
                }}
                ref={stageRef}
            >
                <Layer>
                    {elements.map((el) => {
                        const commonProps = {
                            element: el,
                            isSelected: el.id === selectedElementId,
                            onClick: () => handleSelect(el.id),
                            onDragEnd: (e: any) => handleDragEnd(el.id, e),
                        };

                        if (el.type === 'text') {
                            return (
                                <Text
                                    key={el.id}
                                    id={el.id}
                                    x={el.x * mmToPx}
                                    y={el.y * mmToPx}
                                    text={el.value}
                                    width={el.width * mmToPx} // Important for wrapping
                                    fontSize={el.style.fontSize}
                                    fontFamily={el.style.fontFamily || 'Arial'}
                                    fill={el.style.fill || 'black'}
                                    align={el.style.align || 'left'}
                                    fontStyle={
                                        `${
                                            el.style.fontWeight === 'bold'
                                                ? 'bold'
                                                : ''
                                        } ${
                                            el.style.fontStyle === 'italic'
                                                ? 'italic'
                                                : ''
                                        }`.trim() || 'normal'
                                    }
                                    draggable
                                    onClick={() => handleSelect(el.id)}
                                    onTap={() => handleSelect(el.id)}
                                    onDragEnd={(e) => handleDragEnd(el.id, e)}
                                    onTransform={(e) => {
                                        const node = e.target;
                                        const scaleX = node.scaleX();

                                        // Calculate new width
                                        const newWidth = Math.max(
                                            10,
                                            node.width() * scaleX
                                        );

                                        // Apply new width and reset scale immediately
                                        node.width(newWidth);
                                        node.scaleX(1);
                                        node.scaleY(1);
                                    }}
                                    onTransformEnd={(e) => {
                                        const node = e.target;
                                        actions.updateElement(el.id, {
                                            x: node.x() / mmToPx,
                                            y: node.y() / mmToPx,
                                            width: node.width() / mmToPx,
                                            // We don't update height hard here because it depends on content wrapping
                                            // But if we wanted to support fixed height text boxes, we would.
                                            // For now, auto-height text box behavior is usually preferred.
                                        });
                                    }}
                                />
                            );
                        }
                        if (el.type === 'shape') {
                            return (
                                <Rect
                                    key={el.id}
                                    id={el.id}
                                    x={el.x * mmToPx}
                                    y={el.y * mmToPx}
                                    width={el.width * mmToPx}
                                    height={el.height * mmToPx}
                                    fill={el.style.fill || '#e2e8f0'}
                                    stroke="#94a3b8"
                                    strokeWidth={4} // Increased visibility
                                    draggable
                                    onClick={() => handleSelect(el.id)}
                                    onDragEnd={(e) => handleDragEnd(el.id, e)}
                                />
                            );
                        }
                        if (el.type === 'barcode') {
                            return <BarcodeNode key={el.id} {...commonProps} />;
                        }
                        if (el.type === 'image') {
                            return <QRCodeNode key={el.id} {...commonProps} />;
                        }

                        return null;
                    })}
                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            // limit resize
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            // For this simple editor, we let standard transform happen for shapes/images
                            // Text handles its own scale reset in onTransformEnd
                            return newBox;
                        }}
                    />
                </Layer>
            </Stage>
        </div>
    );
};
