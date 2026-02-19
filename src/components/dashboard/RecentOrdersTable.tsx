import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  buyer_name: string | null;
  buyer_email: string;
  total_amount: number;
  currency: string | null;
  status: string | null;
  created_at: string | null;
}

interface RecentOrdersTableProps {
  orders: Order[];
  title?: string;
}

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
  disputed: "bg-orange-100 text-orange-800",
};

export function RecentOrdersTable({ orders, title = "Recent Orders" }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Order</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2">
                    <span className="font-medium text-headline">#{order.order_number}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-headline text-sm">{order.buyer_name || "Guest"}</p>
                      <p className="text-xs text-muted-foreground">{order.buyer_email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-semibold text-headline">
                      {formatPrice(order.currency, order.total_amount)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <Badge className={statusColors[order.status || "pending_payment"] || "bg-gray-100 text-gray-800"}>
                      {order.status?.replace(/_/g, " ") || "pending"}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-muted-foreground">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString("en-GB") : "N/A"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
