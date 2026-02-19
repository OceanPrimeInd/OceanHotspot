"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Package, Loader2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  images: string[] | null;
  description: string | null;
}

const productPlaceholders: Record<string, React.JSX.Element> = {
  chartplotter: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#1a2332" />
      <rect x="30" y="30" width="140" height="100" rx="8" fill="#0f1923" stroke="#2d4a6f" strokeWidth="2" />
      <rect x="40" y="40" width="120" height="80" rx="4" fill="#0a3d62" />
      <path d="M40 90 L70 70 L100 85 L130 55 L160 75" stroke="#00d4aa" strokeWidth="2" fill="none" />
      <path d="M40 100 L80 95 L120 105 L160 90" stroke="#ffd700" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
      <circle cx="100" cy="80" r="3" fill="#ff6b6b" />
      <circle cx="130" cy="55" r="2" fill="#00d4aa" />
      <text x="100" y="155" textAnchor="middle" fill="#5a7a9a" fontSize="10" fontFamily="sans-serif">CHARTPLOTTER</text>
      <rect x="85" y="132" width="30" height="3" rx="1.5" fill="#2d4a6f" />
    </svg>
  ),
  pod_drive: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#f0f4f8" />
      <ellipse cx="100" cy="170" rx="40" ry="8" fill="#d1dbe6" />
      <rect x="80" y="40" width="40" height="80" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
      <rect x="85" y="45" width="30" height="30" rx="4" fill="#cbd5e1" />
      <circle cx="100" cy="60" r="8" fill="#64748b" />
      <circle cx="100" cy="60" r="4" fill="#94a3b8" />
      <path d="M90 120 L90 150 Q90 165 100 165 Q110 165 110 150 L110 120" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      <ellipse cx="100" cy="165" rx="15" ry="5" fill="#64748b" />
      <path d="M85 165 Q100 175 115 165" stroke="#475569" strokeWidth="2" fill="none" />
      <text x="100" y="192" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="sans-serif">POD DRIVE</text>
    </svg>
  ),
  paint: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#fef3f0" />
      <rect x="55" y="50" width="90" height="100" rx="6" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
      <rect x="60" y="55" width="80" height="35" rx="3" fill="#fef2f2" />
      <text x="100" y="72" textAnchor="middle" fill="#991b1b" fontSize="8" fontFamily="sans-serif" fontWeight="bold">ANTIFOULING</text>
      <text x="100" y="84" textAnchor="middle" fill="#dc2626" fontSize="6" fontFamily="sans-serif">HARD SHELL</text>
      <rect x="65" y="95" width="70" height="2" fill="#991b1b" />
      <rect x="80" y="42" width="40" height="12" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      <rect x="95" y="35" width="10" height="10" rx="2" fill="#64748b" />
      <text x="100" y="175" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">2.5 LITRES</text>
    </svg>
  ),
  jacket: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#eff6ff" />
      <path d="M100 35 L75 45 L60 55 L55 100 L55 155 L80 155 L80 65 L100 55 L120 65 L120 155 L145 155 L145 100 L140 55 L125 45 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
      <path d="M80 65 L80 155 L120 155 L120 65 L100 55 Z" fill="#3b82f6" />
      <line x1="100" y1="55" x2="100" y2="155" stroke="#1d4ed8" strokeWidth="1" strokeDasharray="3 3" />
      <rect x="70" y="100" width="20" height="25" rx="3" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1" />
      <rect x="110" y="100" width="20" height="25" rx="3" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1" />
      <path d="M85 45 L100 35 L115 45" stroke="#1d4ed8" strokeWidth="2" fill="#dbeafe" />
      <text x="100" y="185" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="sans-serif">OFFSHORE JACKET</text>
    </svg>
  ),
  plb: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#fefce8" />
      <rect x="75" y="35" width="50" height="130" rx="10" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
      <rect x="80" y="40" width="40" height="20" rx="4" fill="#fef08a" />
      <circle cx="100" cy="50" r="5" fill="#dc2626" />
      <circle cx="100" cy="50" r="3" fill="#ef4444">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <rect x="85" y="70" width="30" height="30" rx="15" fill="#ca8a04" stroke="#a16207" strokeWidth="2" />
      <text x="100" y="90" textAnchor="middle" fill="#fef08a" fontSize="8" fontFamily="sans-serif" fontWeight="bold">SOS</text>
      <rect x="88" y="110" width="24" height="6" rx="2" fill="#a16207" />
      <rect x="88" y="120" width="24" height="6" rx="2" fill="#a16207" />
      <rect x="90" y="130" width="20" height="25" rx="3" fill="#ca8a04" />
      <text x="100" y="185" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="sans-serif">PLB 406 MHz</text>
    </svg>
  ),
  battery: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#f0fdf4" />
      <rect x="45" y="55" width="110" height="100" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <rect x="55" y="65" width="90" height="25" rx="3" fill="#0f172a" />
      <text x="100" y="82" textAnchor="middle" fill="#22c55e" fontSize="10" fontFamily="sans-serif" fontWeight="bold">LITHIUM</text>
      <text x="100" y="110" textAnchor="middle" fill="#94a3b8" fontSize="18" fontFamily="sans-serif" fontWeight="bold">200Ah</text>
      <text x="100" y="130" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="sans-serif">12V LiFePO4</text>
      <rect x="60" y="45" width="15" height="12" rx="2" fill="#dc2626" />
      <text x="67" y="54" textAnchor="middle" fill="white" fontSize="8" fontFamily="sans-serif">+</text>
      <rect x="125" y="45" width="15" height="12" rx="2" fill="#1e293b" />
      <text x="132" y="54" textAnchor="middle" fill="white" fontSize="8" fontFamily="sans-serif">-</text>
      <text x="100" y="180" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="sans-serif">LEISURE BATTERY</text>
    </svg>
  ),
  windlass: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#f8fafc" />
      <ellipse cx="100" cy="160" rx="50" ry="10" fill="#e2e8f0" />
      <rect x="75" y="100" width="50" height="60" rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
      <circle cx="100" cy="80" r="35" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="100" cy="80" r="25" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="100" cy="80" r="8" fill="#64748b" />
      <circle cx="100" cy="80" r="4" fill="#94a3b8" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <line
          key={i}
          x1={100 + 12 * Math.cos((angle * Math.PI) / 180)}
          y1={80 + 12 * Math.sin((angle * Math.PI) / 180)}
          x2={100 + 22 * Math.cos((angle * Math.PI) / 180)}
          y2={80 + 22 * Math.sin((angle * Math.PI) / 180)}
          stroke="#94a3b8"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <text x="100" y="185" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="sans-serif">ANCHOR WINDLASS</text>
    </svg>
  ),
  vhf: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#f1f5f9" />
      <rect x="65" y="40" width="70" height="130" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <rect x="75" y="50" width="50" height="40" rx="4" fill="#0a3d62" />
      <text x="100" y="68" textAnchor="middle" fill="#00d4aa" fontSize="12" fontFamily="monospace">CH16</text>
      <text x="100" y="82" textAnchor="middle" fill="#5a7a9a" fontSize="7" fontFamily="monospace">156.800</text>
      <rect x="78" y="98" width="12" height="8" rx="2" fill="#475569" />
      <rect x="94" y="98" width="12" height="8" rx="2" fill="#475569" />
      <rect x="110" y="98" width="12" height="8" rx="2" fill="#475569" />
      <rect x="78" y="110" width="12" height="8" rx="2" fill="#475569" />
      <rect x="94" y="110" width="12" height="8" rx="2" fill="#dc2626" />
      <rect x="110" y="110" width="12" height="8" rx="2" fill="#475569" />
      <rect x="80" y="125" width="40" height="15" rx="4" fill="#334155" />
      <line x1="100" y1="40" x2="100" y2="20" stroke="#64748b" strokeWidth="2" />
      <line x1="100" y1="20" x2="115" y2="10" stroke="#64748b" strokeWidth="2" />
      <text x="100" y="185" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="sans-serif">VHF RADIO</text>
    </svg>
  ),
};

function getPlaceholderSvg(title: string): React.JSX.Element | null {
  const t = title.toLowerCase();
  if (t.includes("chartplotter")) return productPlaceholders.chartplotter;
  if (t.includes("pod drive")) return productPlaceholders.pod_drive;
  if (t.includes("antifouling") || t.includes("paint")) return productPlaceholders.paint;
  if (t.includes("jacket")) return productPlaceholders.jacket;
  if (t.includes("locator beacon") || t.includes("plb")) return productPlaceholders.plb;
  if (t.includes("battery") || t.includes("lithium")) return productPlaceholders.battery;
  if (t.includes("windlass")) return productPlaceholders.windlass;
  if (t.includes("vhf")) return productPlaceholders.vhf;
  return null;
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, currency, image_url, images, description")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-o42-blue" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-near-black mb-6">Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const allImages = [
            ...(product.image_url ? [product.image_url] : []),
            ...(product.images || []),
          ].filter((img, idx, arr) => arr.indexOf(img) === idx);
          const hasImage = allImages.length > 0;
          const imageCount = allImages.length;
          const placeholder = getPlaceholderSvg(product.title);

          return (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="bg-card border border-border rounded-md overflow-hidden transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                {hasImage ? (
                  <>
                    <img
                      src={allImages[0]}
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    {imageCount > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{imageCount - 1} more
                      </span>
                    )}
                  </>
                ) : placeholder ? (
                  <div className="w-full h-full group-hover:scale-105 transition-transform duration-200">
                    {placeholder}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8 mb-1" />
                    <span className="text-xs">Product Image</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>
                )}
                <div className="mt-auto">
                  {product.price > 0 ? (
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(product.currency, product.price)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Price on request</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
