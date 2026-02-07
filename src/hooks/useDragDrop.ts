import { useCallback, useRef } from 'react';

/**
 * handles drag and drop file operations
 */
export function useDragDrop(onFilesDropped: (files: File[]) => void) {
    const dragCounterRef = useRef(0);

    // extract files from dataTransfer object
    const extractFiles = useCallback((dt: DataTransfer): File[] => {
        if (dt.items?.length) {
            return Array.from(dt.items)
                .filter(item => item.kind === 'file')
                .map(item => item.getAsFile())
                .filter((file): file is File => file !== null);
        }
        return Array.from(dt.files);
    }, []);

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
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
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

        if (e.dataTransfer) {
            const files = extractFiles(e.dataTransfer);
            await onFilesDropped(files);
        }
    }, [extractFiles, onFilesDropped]);

    return {
        dragCounterRef,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
    };
}
