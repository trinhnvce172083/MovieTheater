'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";

const data = [
  { day: 'Mon', users: 120 },
  { day: 'Tue', users: 200 },
  { day: 'Wed', users: 150 },
  { day: 'Thu', users: 300 },
  { day: 'Fri', users: 180 },
  { day: 'Sat', users: 250 },
  { day: 'Sun', users: 220 },
];

export default function AppLineChart() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-full transition-all duration-300 hover:shadow-md hover:border-gray-300">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Weekly Users</h3>
      <ChartContainer config={{}} className="h-48 w-full">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fill: "#64748B" }} fontSize={11} />
          <YAxis tick={{ fill: "#64748B" }} fontSize={11} />
          <Tooltip />
          <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
