import { toast } from "sonner";

export function toastMessage() {
  return {
    success: (content: string) => {
      toast.success(content);
    },
    error: (content: string) => {
      toast.error(content);
    },
    info: (content: string) => {
      toast.info(content);
    },
    warning: (content: string) => {
      toast.warning(content);
    },
  };
}
