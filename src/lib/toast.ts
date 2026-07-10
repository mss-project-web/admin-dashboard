import { toast } from "@/hooks/use-toast";

type ToastOptions = {
    duration?: number;
};

export const toastUtils = {
    success: (title: string, description: string, options?: ToastOptions) => {
        toast({
            title,
            description,
            className: "bg-emerald-500 text-white border-none",
            duration: options?.duration,
        });
    },

    error: (title: string, description: string, options?: ToastOptions) => {
        toast({
            variant: "destructive",
            title,
            description,
            className: "bg-red-500 text-white border-none",
            duration: options?.duration,
        });
    },

    info: (title: string, description: string, options?: ToastOptions) => {
        toast({
            title,
            description,
            className: "bg-sky-500 text-white border-none",
            duration: options?.duration,
        });
    },

    warning: (title: string, description: string, options?: ToastOptions) => {
        toast({
            title,
            description,
            className: "bg-amber-500 text-white border-none",
            duration: options?.duration,
        });
    }
};
