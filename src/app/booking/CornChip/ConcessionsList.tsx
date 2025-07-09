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
    <div className="lg:col-span-2">
      <div className="grid grid-cols-4 gap-x-4 mb-4 font-bold text-gray-400">
        <div className="col-span-2">COMBO</div>
        <div className="text-right">PRICE</div>
        <div className="text-center">QUANTITY</div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {concessions.map((item, idx) => {
            const concessionId = item.concessionId;
            const currentQuantity = quantities[concessionId] || 0;
            
            return (
              <div key={concessionId ?? `concession-${idx}`} className="flex items-center gap-4 p-2 border-b">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={item.imageUrl || '/popcorn.jpg'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded bg-white border flex-shrink-0"
                    onError={e => { e.currentTarget.src = '/popcorn.jpg'; }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{item.name}</div>
                    <div className="text-sm text-gray-400 truncate">{item.description}</div>
                  </div>
                </div>
                <div className="w-32 text-right font-semibold">
                  {item.price.toLocaleString('vi-VN')} VND
                </div>
                <div className="w-40 flex items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-gray-700 hover:bg-gray-600 border-gray-600" 
                    onClick={() => onQuantityChange(concessionId, -1)} 
                    disabled={currentQuantity <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg w-8 text-center">{currentQuantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-gray-700 hover:bg-gray-600 border-gray-600" 
                    onClick={() => onQuantityChange(concessionId, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 