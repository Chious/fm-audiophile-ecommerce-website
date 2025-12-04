import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Headphones,
  Speaker,
  Bluetooth,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProducts, mockOrders } from "@/data/mockData";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  description?: string;
}) => (
  <Card className="stat-card-gradient animate-fade-up">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className="text-xs text-success flex items-center gap-1 mt-1">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </p>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

const CategoryCard = ({
  name,
  count,
  icon: Icon,
}: {
  name: string;
  count: number;
  icon: React.ElementType;
}) => (
  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
    <div className="p-3 rounded-lg bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <p className="font-medium capitalize">{name}</p>
      <p className="text-sm text-muted-foreground">{count} products</p>
    </div>
  </div>
);

const Dashboard = () => {
  const totalProducts = mockProducts.length;
  const categories = mockProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalValue = mockProducts.reduce((acc, p) => acc + p.price, 0);
  const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
  const totalRevenue = mockOrders.reduce((acc, o) => acc + o.total, 0);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "headphones":
        return Headphones;
      case "speakers":
        return Speaker;
      case "earphones":
        return Bluetooth;
      default:
        return Package;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Audiophile store
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          trend="+2 this month"
          description="In catalogue"
        />
        <StatCard
          title="Total Orders"
          value={mockOrders.length}
          icon={ShoppingCart}
          trend="+12% from last week"
          description="All time"
        />
        <StatCard
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="+8% from last month"
          description="Total sales"
        />
        <StatCard
          title="Customers"
          value={mockOrders.length}
          icon={Users}
          description="Unique buyers"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(categories).map(([name, count]) => (
              <CategoryCard
                key={name}
                name={name}
                count={count}
                icon={getCategoryIcon(name)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${product.price.toLocaleString()}
                    </p>
                    {product.new && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
