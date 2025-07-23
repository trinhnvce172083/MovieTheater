import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus } from 'lucide-react';

interface ConcessionsListProps {
  concessions: any[];
  quantities: { [key: number]: number };
  onQuantityChange: (concessionId: number, delta: number) => void;
  loading: boolean;
  error: string | null;
}

export default function ConcessionsList({ concessions, quantities, onQuantityChange, loading, error }: ConcessionsListProps) {
  return (
    <div className="lg:col-span-2 w-full">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-x-1 md:gap-x-4 mb-2 md:mb-4 font-bold text-gray-400 text-[10px] md:text-base">
        <div className="col-span-2 md:col-span-2">COMBO</div>
        <div className="text-center md:text-right col-start-3">PRICE</div>
        <div className="text-center hidden md:block">QUANTITY</div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-1 md:space-y-4">
          {concessions.map((item, idx) => {
            const concessionId = item.concessionId;
            const currentQuantity = quantities[concessionId] || 0;
            return (
              <>
                {/* Mobile layout */}
                <div key={concessionId + '-mobile'} className="block md:hidden grid grid-cols-3 items-center gap-x-1 p-1 border-b">
                  <div className="flex items-center gap-1 min-w-0 w-full col-span-2">
                    <img
                      src={item.imageUrl || '/popcorn.jpg'}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded bg-white border flex-shrink-0"
                      onError={e => { e.currentTarget.src = '/popcorn.jpg'; }}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-xs">{item.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex flex-col col-start-3">
                    <div className="text-center font-semibold text-xs flex items-center justify-center">
                      {item.price.toLocaleString('vi-VN')} VND
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-gray-700 hover:bg-gray-600 border-gray-600 w-6 h-6 p-0"
                        onClick={() => onQuantityChange(concessionId, -1)} 
                        disabled={currentQuantity <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-xs w-6 text-center">{currentQuantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-gray-700 hover:bg-gray-600 border-gray-600 w-6 h-6 p-0"
                        onClick={() => onQuantityChange(concessionId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Desktop layout */}
                <div key={concessionId + '-desktop'} className="hidden md:grid grid-cols-4 items-center gap-x-4 p-2 border-b">
                  <div className="flex items-center gap-4 min-w-0 w-full col-span-2">
                    <img
                      src={item.imageUrl || '/popcorn.jpg'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded bg-white border flex-shrink-0"
                      onError={e => { e.currentTarget.src = '/popcorn.jpg'; }}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-base">{item.name}</div>
                      <div className="text-sm text-gray-400 truncate">{item.description}</div>
                    </div>
                  </div>
                  <div className="text-right font-semibold text-base flex items-center justify-end">
                    {item.price.toLocaleString('vi-VN')} VND
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-gray-700 hover:bg-gray-600 border-gray-600 w-8 h-8 p-0"
                      onClick={() => onQuantityChange(concessionId, -1)} 
                      disabled={currentQuantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">{currentQuantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-gray-700 hover:bg-gray-600 border-gray-600 w-8 h-8 p-0"
                      onClick={() => onQuantityChange(concessionId, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            );
          })}
        </div>
      )}
    </div>
  );
} 