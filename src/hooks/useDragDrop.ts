import { useCallback } from 'react';

export function useDragDrop(onFilesDropped: (files: File[]) => void) {
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const dt = e.dataTransfer;
        if (!dt) return;
        const files = dt.items?.length
            ? Array.from(dt.items).filter(i => i.kind === 'file').map(i => i.getAsFile()).filter((f): f is File => f !== null)
            : Array.from(dt.files);
        if (files.length) await onFilesDropped(files);
    }, [onFilesDropped]);

    return { handleDragOver, handleDrop };
}
