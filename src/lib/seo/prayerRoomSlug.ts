const THAI_NAME_EN: Record<string, string> = {
    'ตึกกิจกรรมนักศึกษา': 'Student Activity Building Prayer Room',
    'คณะวิทยาการจัดการ': 'Faculty of Management Sciences Prayer Room',
    'คณะทรัพยากรธรรมชาติ': 'Faculty of Natural Resources Prayer Room',
    'คณะวิทยาศาสตร์': 'Faculty of Science Prayer Room',
    'คณะวิศวกรรม': 'Faculty of Engineering Prayer Room',
    'คณะวิศวกรรมศาสตร์': 'Faculty of Engineering Prayer Room',
    'ศิลปศาสตร์': 'Faculty of Liberal Arts Prayer Room',
    'คณะศิลปศาสตร์': 'Faculty of Liberal Arts Prayer Room',
    'คณะเภสัชศาสตร์': 'Faculty of Pharmaceutical Sciences Prayer Room',
    'ตึกสหเวชศาสตร์และทรัพยากรธรรมชาติ': 'Allied Health Sciences and Natural Resources Building Prayer Room',
    'คณะอุตสาหกรรมเกษตร': 'Faculty of Agro-Industry Prayer Room',
    'ภายในคณะอุตสาหกรรมเกษตร': 'Inside Faculty of Agro-Industry Prayer Room',
    'คณะนิติศาสตร์': 'Faculty of Law Prayer Room',
    'คณะเศรษฐศาสตร์': 'Faculty of Economics Prayer Room',
    'คณะสัตวแพทยศาสตร์': 'Faculty of Veterinary Science Prayer Room',
    'โรงพยาบาลสงขลานครินทร์': 'Songklanagarind Hospital Prayer Room',
    'วันศุกร์ Sport Complex': 'Friday Sport Complex Prayer Room',
};

export function englishPrayerRoomName(nameTh?: string, name?: string): string | undefined {
    const source = nameTh?.trim() || name?.trim();
    return source ? THAI_NAME_EN[source] : undefined;
}

export function slugifyAscii(value?: string): string {
    return (value ?? '')
        .normalize('NFKD')
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-');
}

export function buildPrayerRoomSlug(input: {
    slug?: string;
    name_en?: string;
    name_th?: string;
    name?: string;
}, fallback: string): string {
    const explicit = slugifyAscii(input.slug);
    if (explicit) return explicit;

    const source = input.name_en?.trim()
        || englishPrayerRoomName(input.name_th, input.name)
        || input.name_th?.trim()
        || input.name?.trim();
    return slugifyAscii(source) || fallback;
}
