export const FILE_BASE_URL = (import.meta.env.VITE_FILE_BASE_URL || '').replace(/\/$/, '');

export const resolveFileUrl = (filePath) => {
    if (!filePath) {
        return '';
    }

    if (/^https?:\/\//i.test(filePath)) {
        return filePath;
    }

    if (!FILE_BASE_URL) {
        return filePath;
    }

    return `${FILE_BASE_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};
