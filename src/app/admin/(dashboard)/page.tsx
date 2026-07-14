import { getDashboardStats, getRecentOrders } from "@/lib/supabase/admin-queries";
import { StatCard } from "@/components/admin/StatCard";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [stats, orders] = await Promise.all([getDashboardStats(), getRecentOrders(10)]);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-ink">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Orders Today" value={stats.ordersToday} />
        <StatCard label="Orders This Week" value={stats.ordersThisWeek} />
        <StatCard
          label="Top Category"
          value={stats.topCategory ? stats.topCategory.name : "—"}
          sub={stats.topCategory ? `${stats.topCategory.orderCount} orders` : undefined}
        />
      </div>

      <h2 className="mb-3 font-serif text-lg text-ink">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="font-sans text-sm text-ink-soft">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink/10 bg-white">
          <table className="w-full text-left font-sans text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 text-ink">{order.customerName}</td>
                  <td className="px-4 py-3 text-ink-soft">{order.itemCount}</td>
                  <td className="px-4 py-3 text-ink">₹{order.total.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs capitalize text-gold-dark">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
