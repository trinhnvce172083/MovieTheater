'use client';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";

const data = [
  { name: 'Vaccine A', value: 45 },
  { name: 'Vaccine B', value: 30 },
  { name: 'Vaccine C', value: 25 },
];

const COLORS = ['#2563eb', '#10b981', '#f97316'];

export default function AppPieChart() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-full transition-all duration-300 hover:shadow-md hover:border-gray-300">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Vaccine Usage</h3>
      <ChartContainer config={{}} className="h-48 w-full">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value" label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
