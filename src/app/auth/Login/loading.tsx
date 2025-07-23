import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen h-screen flex items-center justify-center p-1 sm:p-2 md:p-4 lg:p-8 xl:p-12">
      <Card
        className="w-full gap-0 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-md shadow-lg p-1 sm:p-2 md:p-4 rounded-lg sm:rounded-xl"
        style={{ background: "#F8F6F3", backdropFilter: "blur(8px)" }}
      >
        <div className="text-center mb-2 sm:mb-4">
          <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 mx-auto mb-1 sm:mb-2" />
        </div>
        <div className="space-y-2 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            <Skeleton className="h-8 sm:h-10 w-full" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            <Skeleton className="h-8 sm:h-10 w-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 sm:h-4 w-3 sm:w-4" />
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
          </div>
          <Skeleton className="h-8 sm:h-10 w-full" />
          <div className="space-y-1 sm:space-y-2">
            <Skeleton className="h-3 sm:h-4 w-40 sm:w-48 mx-auto" />
            <Skeleton className="h-3 sm:h-4 w-32 sm:w-40 mx-auto" />
          </div>
        </div>
      </Card>
    </div>
  );
}