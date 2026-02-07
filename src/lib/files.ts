// file picker interface for modern browsers
interface FilePickerHandle {
    getFile(): Promise<File>;
}

/**
 * opens file picker dialog and returns selected files
 */
export async function selectFiles(): Promise<File[]> {
    // use modern file system api if available
    if ('showOpenFilePicker' in window) {
        const handles = await (window as any).showOpenFilePicker({ multiple: true }) as FilePickerHandle[];
        return Promise.all(handles.map(handle => handle.getFile()));
    }

    // fallback to input element
    return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = () => resolve(Array.from(input.files || []));
        input.click();
    });
}
