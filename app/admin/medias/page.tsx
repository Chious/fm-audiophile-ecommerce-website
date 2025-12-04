"use client";

import { useState } from "react";
import {
  Search,
  Image as ImageIcon,
  Eye,
  Trash2,
  Globe,
  Lock,
  MoreHorizontal,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { getBlobImageUrl } from "@/utils/r2-image";

// Mock media data - in the future, this would come from Vercel Blob API
const mockMedia = [
  {
    id: "1",
    path: "./assets/product-yx1-earphones/mobile/image-product.jpg",
    name: "image-product.jpg",
    size: 245678,
    uploadedAt: new Date("2024-01-15"),
    access: "public" as const,
    type: "image/jpeg",
  },
  {
    id: "2",
    path: "./assets/product-xx99-mark-two-headphones/desktop/image-product.jpg",
    name: "image-product.jpg",
    size: 312456,
    uploadedAt: new Date("2024-01-16"),
    access: "public" as const,
    type: "image/jpeg",
  },
  {
    id: "3",
    path: "./assets/shared/desktop/logo.svg",
    name: "logo.svg",
    size: 12345,
    uploadedAt: new Date("2024-01-10"),
    access: "public" as const,
    type: "image/svg+xml",
  },
  {
    id: "4",
    path: "./assets/product-zx9-speaker/tablet/image-gallery-1.jpg",
    name: "image-gallery-1.jpg",
    size: 198765,
    uploadedAt: new Date("2024-01-20"),
    access: "public" as const,
    type: "image/jpeg",
  },
  {
    id: "5",
    path: "./assets/home/desktop/image-hero.jpg",
    name: "image-hero.jpg",
    size: 456789,
    uploadedAt: new Date("2024-01-12"),
    access: "private" as const,
    type: "image/jpeg",
  },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const MediaPage = () => {
  const [search, setSearch] = useState("");
  const [accessFilter, setAccessFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredMedia = mockMedia.filter((media) => {
    const matchesSearch =
      media.name.toLowerCase().includes(search.toLowerCase()) ||
      media.path.toLowerCase().includes(search.toLowerCase());
    const matchesAccess =
      accessFilter === "all" || media.access === accessFilter;
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "image" && media.type.startsWith("image/")) ||
      (typeFilter === "svg" && media.type === "image/svg+xml");
    return matchesSearch && matchesAccess && matchesType;
  });

  const totalSize = filteredMedia.reduce((sum, m) => sum + m.size, 0);

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality with Vercel Blob API
    console.log("Delete media:", id);
    alert(`Delete media ${id} - To be implemented with Vercel Blob API`);
  };

  const handleToggleAccess = (
    id: string,
    currentAccess: "public" | "private"
  ) => {
    // TODO: Implement toggle access functionality with Vercel Blob API
    console.log("Toggle access:", id, currentAccess);
    alert(
      `Toggle access for ${id} from ${currentAccess} - To be implemented with Vercel Blob API`
    );
  };

  const handleView = (path: string) => {
    const url = getBlobImageUrl(path);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            {filteredMedia.length} file{filteredMedia.length !== 1 ? "s" : ""} ·{" "}
            {formatFileSize(totalSize)} total
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={accessFilter} onValueChange={setAccessFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedia.map((media) => (
                  <TableRow key={media.id} className="group">
                    <TableCell>
                      {media.type.startsWith("image/") ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary border">
                          <Image
                            src={getBlobImageUrl(media.path)}
                            alt={media.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center border">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{media.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {media.type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-mono text-muted-foreground max-w-md truncate">
                        {media.path}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(media.size)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {media.uploadedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          media.access === "public"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {media.access === "public" ? (
                          <>
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleView(media.path)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(getBlobImageUrl(media.path), "_blank")
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleAccess(media.id, media.access)
                            }
                          >
                            {media.access === "public" ? (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Make Private
                              </>
                            ) : (
                              <>
                                <Globe className="h-4 w-4 mr-2" />
                                Make Public
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(media.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMedia.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No media files found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaPage;
