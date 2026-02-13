
export function createFormDataForUpdate(
    data: Record<string, any>,
    newImages?: File[],
    deletedImageUrls?: string[]
): FormData {
    const formData = new FormData();

    // 1. Append Text Data
    Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value !== undefined && value !== null) {
            // Handle special cases: objects to JSON string (excluding Date and File)
            if (typeof value === 'object' && !(value instanceof Date) && !(value instanceof File)) {
                formData.append(key, JSON.stringify(value));
            } else if (value instanceof Date) {
                formData.append(key, value.toISOString());
            } else {
                formData.append(key, value as string); // Cast to string or let append handle it
            }
        }
    });

    // 2. Append New Images
    if (newImages && newImages.length > 0) {
        newImages.forEach((file) => {
            formData.append('images', file);
        });
    }

    // 3. Append Deleted Images
    if (deletedImageUrls && deletedImageUrls.length > 0) {
        formData.append('delete_images', JSON.stringify(deletedImageUrls));
    }

    return formData;
}
