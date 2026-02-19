import type { Category } from "@/types";
import API from "@/utils/api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const useCategories = () => {
  const [categories, setCategories] = useState<(Category & { id: string })[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const res = await API.get("/categories").send();
      if (!res.success) {
        toast.error(res.message);
        setLoading(false);
        return;
      }
      setCategories(res.data);
      setLoading(false);
    };
    fetchCategories();
  }, [refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, [])

  return { categories, loading, refetch };
};

export default useCategories;
