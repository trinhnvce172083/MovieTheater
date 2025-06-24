import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus } from 'lucide-react';

export default function ConcessionsList({ concessions, quantities, onQuantityChange, loading, error }) {
  return (
    <div className="lg:col-span-2">
      <div className="grid grid-cols-3 gap-x-4 mb-4 font-bold text-gray-400">
        <div>COMBO</div>
        <div className="text-right">PRICE</div>
        <div className="text-center">QUANTITY</div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {concessions.map((item, idx) => (
            <div key={item.id ?? item.concessionId ?? `concession-${idx}`}>
              <div className="grid grid-cols-3 gap-x-4 items-center">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  {item.description && <p className="text-sm text-gray-400">{item.description}</p>}
                </div>
                <div className="text-right font-semibold">
                  {item.price.toLocaleString('vi-VN')} VND
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" className="bg-gray-700 hover:bg-gray-600 border-gray-600" onClick={() => onQuantityChange(item.id ?? item.concessionId, -1)} disabled={(quantities[item.id ?? item.concessionId] || 0) <= 0}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg w-8 text-center">{quantities[item.id ?? item.concessionId] || 0}</span>
                  <Button variant="outline" size="icon" className="bg-gray-700 hover:bg-gray-600 border-gray-600" onClick={() => onQuantityChange(item.id ?? item.concessionId, 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator className="mt-4 bg-gray-700" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 