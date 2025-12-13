export async function selectFiles(): Promise<File[]> {
    if ('showOpenFilePicker' in window) {
        // @ts-ignore
        const handles = await window.showOpenFilePicker({ multiple: true });
        return Promise.all(handles.map((fh: any) => fh.getFile()));
    }

    return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e: any) => resolve(Array.from(e.target.files || []));
        input.click();
    });
}
