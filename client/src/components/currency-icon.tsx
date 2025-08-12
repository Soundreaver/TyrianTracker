import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/loading-skeleton";

interface CurrencyIconProps {
  currencyId: number;
  className?: string;
}

export function CurrencyIcon({ currencyId, className }: CurrencyIconProps) {
  const { data: currencies = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/currencies"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/currencies");
      return response.json();
    },
    staleTime: Infinity,
  });

  if (isLoading) {
    return <Skeleton className={className} />;
  }

  const currency = currencies.find(c => c.id === currencyId);
  const iconUrl = currency?.icon;

  return iconUrl ? (
    <img src={iconUrl} alt={currency?.name || `Currency ${currencyId}`} className={className} />
  ) : null;
}
