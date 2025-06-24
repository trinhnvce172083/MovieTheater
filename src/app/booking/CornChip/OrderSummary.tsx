import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function OrderSummary({ movieDetails, totalOrder }) {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <Image src={movieDetails.image} alt={movieDetails.title} width={400} height={250} className="rounded-t-lg object-cover" />
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2 text-center">
          <CardTitle className="text-xl">{movieDetails.title}</CardTitle>
          <p className="text-gray-300">{movieDetails.date}</p>
          <p className="text-gray-300">{movieDetails.details}</p>
        </div>
        <Separator className="bg-gray-700"/>
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Total Order</h3>
          <p className="text-3xl font-extrabold">{totalOrder.toLocaleString('vi-VN')} VND</p>
        </div>
        <div className="flex items-center gap-3 pt-6 w-full">
          <Button variant="outline" size="icon" className="border-purple-600 bg-gray-700 hover:bg-purple-100 hover:border-purple-700 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-purple-600" />
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold shadow-lg hover:from-purple-600 hover:to-purple-800 border-0 rounded-lg px-6 py-2 text-base min-h-0 h-auto">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 