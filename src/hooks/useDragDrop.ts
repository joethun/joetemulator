import { useCallback, useRef } from 'react';

export function useDragDrop(onFilesDropped: (files: File[]) => void) {
    const dragCounterRef = useRef(0);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.types.includes('Files')) {
            dragCounterRef.current++;
            e.dataTransfer.dropEffect = 'copy';
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        const dt = e.dataTransfer;
        if (!dt) return;

        const files = dt.items?.length
            ? Array.from(dt.items).filter(i => i.kind === 'file').map(i => i.getAsFile()).filter((f): f is File => f !== null)
            : Array.from(dt.files);

        if (files.length) await onFilesDropped(files);
    }, [onFilesDropped]);

    return { handleDragEnter, handleDragOver, handleDragLeave, handleDrop };
}
