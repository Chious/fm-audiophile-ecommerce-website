import { Package, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/types/api";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductDetailDialog = ({
  product,
  open,
  onOpenChange,
}: ProductDetailDialogProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-100px)]">
          <div className="space-y-6 pr-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize">
                {product.category}
              </Badge>
              {product.new && (
                <Badge className="bg-primary/10 text-primary border-0">
                  NEW
                </Badge>
              )}
              <Badge variant="outline">ID: {product.id}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Slug</p>
                <p className="font-mono text-sm">{product.slug}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-primary">
                  ${product.price.toLocaleString()}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Features</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {product.features}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">In the Box</h4>
              <div className="space-y-2">
                {product.includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <span className="text-primary font-semibold w-8">
                      {item.quantity}x
                    </span>
                    <span className="text-muted-foreground">{item.item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Related Products</h4>
              <div className="grid grid-cols-3 gap-3">
                {product.others.map((related, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-secondary/50 text-center"
                  >
                    <div className="w-full aspect-square rounded bg-card flex items-center justify-center mb-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium truncate">
                      {related.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
