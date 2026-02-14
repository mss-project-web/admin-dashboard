import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange
}: PaginationProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>แสดง:</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        onItemsPerPageChange(Number(e.target.value));
                        onPageChange(1);
                    }}
                    className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-sky-600 outline-none cursor-pointer"
                >
                    {[10, 20, 50, 100].map(val => (
                        <option key={val} value={val}>{val}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-1">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(1)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                    title="หน้าแรก"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                    title="หน้าก่อนหน้า"
                >
                    <ChevronLeft size={16} />
                </button>

                <span className="mx-2 text-xs font-bold text-sky-600 whitespace-nowrap">
                    หน้า {currentPage} / {totalPages || 1}
                </span>

                <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                    title="หน้าถัดไป"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => onPageChange(totalPages)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                    title="หน้าสุดท้าย"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}

export function PaginationInfo({ totalItems }: { totalItems: number }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-center items-center text-xs font-bold text-slate-400 uppercase tracking-widest shadow-sm">
            <span>Total Records: {totalItems}</span>
        </div>
    );
}
