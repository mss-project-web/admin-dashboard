export interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isFloating?: boolean;
}