import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesData {
  name: string;
  sales: number;
  orders: number;
}

interface SalesChartProps {
  data: SalesData[];
  title: string;
  type?: "area" | "bar";
}

export function SalesChart({ data, title, type = "area" }: SalesChartProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "area" ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(240 100% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(240 100% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 96%)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 47%)", fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 47%)", fontSize: 12 }}
                  tickFormatter={(value) => `£${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(0 0% 100%)", 
                    border: "1px solid hsl(210 40% 96%)",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                  formatter={(value: number) => [`£${value.toLocaleString()}`, "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(240 100% 50%)"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 96%)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 47%)", fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 47%)", fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(0 0% 100%)", 
                    border: "1px solid hsl(210 40% 96%)",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
                <Bar dataKey="orders" fill="hsl(20 100% 54%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
