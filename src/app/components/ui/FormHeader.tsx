import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface FormHeaderProps {
  title: string;
  backUrl: string;
  formId: string;
  isLoading?: boolean;
  saveLabel?: string;
}

export function FormHeader({
  title,
  backUrl,
  formId,
  isLoading = false,
  saveLabel = "บันทึกข้อมูล",
}: FormHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 mt-0 flex flex-row items-center justify-between gap-2 md:gap-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm py-3 md:py-4 border-b border-slate-200 dark:border-slate-800 -mx-4 md:-mx-6 px-4 md:px-6 mb-4 md:mb-6">
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="p-1.5 md:p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0 text-slate-500 -ml-1.5 md:-ml-2"
        >
          <ChevronLeft size={22} className="md:w-[20px] md:h-[20px]" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-xl font-bold text-slate-800 dark:text-white truncate">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(backUrl)}
          disabled={isLoading}
          className="hidden sm:flex px-4 py-2 text-center text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg md:rounded-xl font-bold text-sm transition-colors h-10"
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          form={formId}
          disabled={isLoading}
          className="px-3 md:px-6 py-1.5 md:py-2 bg-sky-500 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20 flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50 h-8 md:h-10"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} className="md:w-[18px] md:h-[18px]" />
          )}
          <span>{saveLabel}</span>
        </Button>
      </div>
    </div>
  );
}
