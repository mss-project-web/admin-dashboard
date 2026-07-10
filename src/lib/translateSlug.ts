/**
 * Translates a Thai title to English using Google's free translate API
 * and converts it into a URL-friendly slug.
 */
export async function generateSlugFromThai(thaiTitle: string): Promise<string> {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=en&dt=t&q=${encodeURIComponent(thaiTitle)}`;
        const response = await fetch(url);
        const data = await response.json();

        // Google returns [[["translated text","original text",...],...],...]
        // Concatenate all translated segments
        const translated: string = data[0]
            .map((segment: any[]) => segment[0])
            .join(' ');

        // Convert to slug: lowercase, spaces to hyphens, strip non-alphanumeric
        const slug = translated
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return slug;
    } catch (error) {
        console.error('Translation failed:', error);
        throw new Error('ไม่สามารถแปลหัวข้อได้ กรุณาลองใหม่');
    }
}
