import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your admin dashboard</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Demo Mode
            </CardTitle>
            <CardDescription>
              This dashboard is running with mock data for demonstration
              purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                All data shown in this dashboard is simulated. The products,
                orders, and statistics are placeholder data to showcase the
                admin interface functionality.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="font-medium">Products</p>
                <p className="text-sm text-muted-foreground">6 demo products</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="font-medium">Orders</p>
                <p className="text-sm text-muted-foreground">5 sample orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
