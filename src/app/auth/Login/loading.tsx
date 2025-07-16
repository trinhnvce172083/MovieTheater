import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen h-screen flex items-center justify-center p-2 sm:p-4 md:p-8 lg:p-12">
      <Card
        className="w-full gap-0 max-w-sm sm:max-w-md md:max-w-md lg:max-w-md shadow-lg p-2 sm:p-4 rounded-xl"
        style={{ background: "#F8F6F3", backdropFilter: "blur(8px)" }}
      >
        <div className="text-center mb-4">
          <Skeleton className="h-8 w-24 mx-auto mb-2" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        </div>
      </Card>
    </div>
  );
}