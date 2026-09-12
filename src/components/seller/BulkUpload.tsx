"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { formatPrice } from "@/lib/utils";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  isValidDomainCategory,
  normalizeDomainCategory,
  VALID_DOMAIN_CATEGORY_SLUGS,
} from "@/config/productCategories";

interface ParsedProduct {
  title: string;
  description: string;
  price: number;
  currency: string;
  entity_type: string;
  domain_category: string;
  vat_treatment: string;
  availability_status: string;
  condition: string;
  brand: string;
  image_url: string;
  is_valid: boolean;
  errors: string[];
}

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

export function BulkUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".csv")
    ) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);
    setParsedProducts([]);

    if (!selectedFile.name.endsWith(".csv")) {
      toast({
        title: "CSV required",
        description: "Please upload a .csv file. Download our template and save as CSV from Excel if needed.",
        variant: "destructive",
      });
      setFile(null);
      return;
    }

    setParsing(true);
    const text = await selectedFile.text();
    const products = parseCSV(text);
    setParsedProducts(products);
    setParsing(false);
  };

  const parseCSV = (text: string): ParsedProduct[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const products: ParsedProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const product = mapToProduct(headers, values, i);
      products.push(product);
    }

    return products;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const mapToProduct = (
    headers: string[],
    values: string[],
    rowNum: number
  ): ParsedProduct => {
    const errors: string[] = [];
    const getValue = (key: string) => {
      const index = headers.indexOf(key);
      return index >= 0 ? values[index] || "" : "";
    };

    const title = getValue("title");
    const description = getValue("description");
    const priceStr = getValue("price");
    const price = parseFloat(priceStr) || 0;
    const currency = getValue("currency") || "GBP";
    const entity_type = getValue("entity_type");
    const rawCategory = getValue("domain_category");
    const domain_category = normalizeDomainCategory(rawCategory) || rawCategory;
    const vat_treatment = getValue("vat_treatment") || "inclusive";
    const availability_status = getValue("availability_status") || "in_stock";
    const condition = getValue("condition") || "new";
    const brand = getValue("brand");
    const image_url = getValue("image_url");

    // Validation
    if (!title) errors.push(`Row ${rowNum}: Title is required`);
    if (price <= 0) errors.push(`Row ${rowNum}: Invalid price`);
    if (!["GBP", "USD", "EUR"].includes(currency.toUpperCase())) {
      errors.push(`Row ${rowNum}: Currency must be GBP, USD, or EUR`);
    }
    if (domain_category && !isValidDomainCategory(domain_category)) {
      errors.push(
        `Row ${rowNum}: domain_category must be one of: ${VALID_DOMAIN_CATEGORY_SLUGS.join(", ")}`
      );
    }

    return {
      title,
      description,
      price,
      currency: currency.toUpperCase(),
      entity_type,
      domain_category,
      vat_treatment,
      availability_status,
      condition,
      brand,
      image_url,
      is_valid: errors.length === 0,
      errors,
    };
  };

  const handleUpload = async () => {
    if (!user || parsedProducts.length === 0) return;

    const validProducts = parsedProducts.filter((p) => p.is_valid);
    if (validProducts.length === 0) {
      toast({
        title: "No Valid Products",
        description: "Please fix the errors in your file and try again.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let success = 0;
    let failed = 0;
    const uploadErrors: string[] = [];

    for (let i = 0; i < validProducts.length; i++) {
      const product = validProducts[i];

      const { error } = await supabase.from("products").insert({
        seller_id: user.id,
        title: product.title,
        description: product.description || null,
        price: product.price,
        currency: product.currency,
        entity_type: product.entity_type || null,
        domain_category: product.domain_category || null,
        vat_treatment: product.vat_treatment,
        availability_status: product.availability_status,
        condition: product.condition,
        brand: product.brand || null,
        image_url: product.image_url || null,
        status: "draft",
      });

      if (error) {
        failed++;
        uploadErrors.push(`${product.title}: ${error.message}`);
      } else {
        success++;
      }

      setUploadProgress(Math.round(((i + 1) / validProducts.length) * 100));
    }

    setUploadResult({ success, failed, errors: uploadErrors });
    setUploading(false);

    if (success > 0) {
      toast({
        title: "Upload Complete",
        description: `${success} products created successfully${
          failed > 0 ? `, ${failed} failed` : ""
        }.`,
      });
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "title",
      "description",
      "price",
      "currency",
      "entity_type",
      "domain_category",
      "vat_treatment",
      "availability_status",
      "condition",
      "brand",
      "image_url",
    ];
    const exampleRow = [
      "Marine GPS Navigator",
      "High-precision GPS for commercial vessels",
      "2500",
      "GBP",
      "physical_product",
      "electronics",
      "plus_vat",
      "in_stock",
      "new",
      "Garmin",
      "https://example.com/product.jpg",
    ];

    const csv = [headers.join(","), exampleRow.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocean_hotspot_product_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setParsedProducts([]);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validCount = parsedProducts.filter((p) => p.is_valid).length;
  const invalidCount = parsedProducts.filter((p) => !p.is_valid).length;

  return (
    <div className="space-y-6">
      {/* Header & Template Download */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Bulk Product Upload</h2>
          <p className="text-sm text-muted-foreground">
            Upload multiple products at once using a CSV file
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      {!file ? (
        <div
          className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-headline mb-2">
            Upload CSV or Excel File
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to browse
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Select File
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Parsing Status */}
          {parsing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Parsing file...
            </div>
          )}

          {/* Validation Summary */}
          {parsedProducts.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                {validCount} valid products
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {invalidCount} products with errors
                </div>
              )}
            </div>
          )}

          {/* Preview Table */}
          {parsedProducts.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedProducts.slice(0, 10).map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {product.is_valid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.title || "-"}
                        </TableCell>
                        <TableCell>
                          {formatPrice(product.currency, product.price)}
                        </TableCell>
                        <TableCell>
                          {product.domain_category || "-"}
                        </TableCell>
                        <TableCell className="text-destructive text-xs">
                          {product.errors.join(", ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsedProducts.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground border-t">
                  Showing 10 of {parsedProducts.length} products
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Uploading products... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Alert
              variant={uploadResult.failed > 0 ? "destructive" : "default"}
            >
              {uploadResult.failed > 0 ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertTitle>Upload Complete</AlertTitle>
              <AlertDescription>
                {uploadResult.success} products created successfully.
                {uploadResult.failed > 0 && (
                  <> {uploadResult.failed} products failed to upload.</>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="o42Primary"
              onClick={handleUpload}
              disabled={uploading || validCount === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {validCount} Products
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearFile}>
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Products will be created as drafts. You can publish them from your
            dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
