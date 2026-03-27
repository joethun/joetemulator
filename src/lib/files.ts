export async function selectFiles(): Promise<File[]> {
    if ('showOpenFilePicker' in window) {
        const handles = await (window as any).showOpenFilePicker({ multiple: true });
        return Promise.all(handles.map((h: any) => h.getFile()));
    }

    return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = () => resolve(Array.from(input.files || []));
        input.click();
    });
}
