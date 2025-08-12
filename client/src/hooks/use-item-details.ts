import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Batching mechanism
const itemQueue = new Set<number>();
let batchTimeout: NodeJS.Timeout | null = null;

// Function to process the batch
const processBatch = async () => {
  if (itemQueue.size === 0) return;

  const ids = Array.from(itemQueue);
  itemQueue.clear();

  try {
    const response = await apiRequest("POST", "/api/items-bulk", { ids });
    const items = await response.json();
    
    // Cache each item individually
    items.forEach((item: any) => {
      queryClient.setQueryData(["item", item.id], item);
    });
  } catch (error) {
    console.error("Failed to fetch bulk item details:", error);
  }
};

// Custom hook to use the batching mechanism
export function useItemDetails(itemId: number) {
  const { data, ...rest } = useQuery({
    queryKey: ["item", itemId],
    queryFn: async () => {
      // Add to queue and debounce
      itemQueue.add(itemId);
      if (batchTimeout) clearTimeout(batchTimeout);
      batchTimeout = setTimeout(processBatch, 50); // 50ms debounce window

      // Return a promise that will resolve when the batch is processed
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const cachedData = queryClient.getQueryData(["item", itemId]);
          if (cachedData) {
            clearInterval(interval);
            resolve(cachedData);
          }
        }, 100);
      });
    },
    enabled: !!itemId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return { data, ...rest };
}
