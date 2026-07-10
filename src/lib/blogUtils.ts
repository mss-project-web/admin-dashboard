import { BlogContentBlock } from "@/types/blog";

export function htmlToBlocks(html: string): BlogContentBlock[] {
    if (!html || !html.trim()) {
        return [{ type: "paragraph", data: "" }];
    }

    const blocks: BlogContentBlock[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const nodes = Array.from(doc.body.childNodes);

    nodes.forEach((node) => {
        if (node.nodeName === 'P') {
            const text = (node.textContent || '').trim();
            if (text) {
                blocks.push({
                    type: "paragraph",
                    data: text
                });
            }
        }
        else if (node.nodeName === 'IMG') {
            const img = node as HTMLImageElement;
            const url = img.src || '';
            const caption = img.alt || '';
            
            if (url) {
                blocks.push({
                    type: "image",
                    data: { url, caption }
                });
            }
        }
        else if (node.nodeName.match(/^H[1-6]$/)) {
            const text = (node.textContent || '').trim();
            if (text) {
                blocks.push({
                    type: "paragraph",
                    data: text
                });
            }
        }
        else if (node.nodeType === Node.TEXT_NODE) {
            const text = (node.textContent || '').trim();
            if (text) {
                blocks.push({
                    type: "paragraph",
                    data: text
                });
            }
        }
    });

    return blocks.length > 0 ? blocks : [{ type: "paragraph", data: "" }];
}


export function blocksToHtml(blocks: BlogContentBlock[]): string {
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return '';
    }

    return blocks.map(block => {
        if (block.type === 'paragraph') {
            return `<p>${block.data}</p>`;
        }
        if (block.type === 'image') {
            const imageData = typeof block.data === 'string' 
                ? { url: block.data, caption: '' }
                : block.data;
            return `<img src="${imageData.url}" alt="${imageData.caption || ''}" class="rounded-lg max-w-full h-auto my-4" />`;
        }
        return '';
    }).join('');
}
