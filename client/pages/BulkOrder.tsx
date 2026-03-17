import { useState, useCallback, useRef, useEffect } from "react";
import { Button, Row, Col, App, Spin } from "antd";
import { ShoppingCartOutlined, SyncOutlined, LoadingOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { apiConfig } from "../config/apiConfig";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { fetchProductByUpc, fetchBestPrices, transformProductResponse, type PriceRequestItem } from "../services/productService";
import LineByLinePanel, {
  type OrderEntry,
  type EntryError,
} from "../components/bulk-order/LineByLinePanel";
import PastePanel from "../components/bulk-order/PastePanel";

type Source = "lines" | "paste" | null;

const EMPTY_ROWS: OrderEntry[] = [
  { itemCode: "", quantity: "" },
  { itemCode: "", quantity: "" },
  { itemCode: "", quantity: "" },
];

function entriesToText(entries: OrderEntry[]): string {
  return entries
    .filter((e) => e.itemCode.trim() || e.quantity.trim())
    .map((e) => `${e.itemCode.trim()},${e.quantity.trim()}`)
    .join("\n");
}

function textToEntries(text: string): OrderEntry[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return [...EMPTY_ROWS];

  return lines.map((line) => {
    // Support comma, space, or tab as separator
    const parts = line.split(/[,\t]+/).map((p) => p.trim());
    if (parts.length < 2) {
      // Try space separator: last token is qty, rest is UPC
      const spaceParts = line.trim().split(/\s+/);
      if (spaceParts.length >= 2) {
        const qty = spaceParts[spaceParts.length - 1];
        const upc = spaceParts.slice(0, -1).join(" ");
        return { itemCode: upc, quantity: qty };
      }
    }
    return {
      itemCode: parts[0] || "",
      quantity: parts[1] || "",
    };
  });
}

function validateEntries(entries: OrderEntry[]): {
  errors: EntryError[];
  validCount: number;
} {
  const errors: EntryError[] = [];
  let validCount = 0;

  entries.forEach((entry, row) => {
    const hasCode = entry.itemCode.trim().length > 0;
    const hasQty = entry.quantity.trim().length > 0;

    if (!hasCode && !hasQty) return;

    let rowValid = true;

    if (!hasCode) {
      errors.push({ row, field: "itemCode", message: "Required" });
      rowValid = false;
    }

    if (!hasQty) {
      errors.push({ row, field: "quantity", message: "Required" });
      rowValid = false;
    } else if (isNaN(Number(entry.quantity)) || Number(entry.quantity) <= 0) {
      errors.push({ row, field: "quantity", message: "Must be > 0" });
      rowValid = false;
    }

    if (rowValid) validCount++;
  });

  return { errors, validCount };
}

function validatePasteText(text: string): string | null {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const parts = line.split(/[,\t]+/);
    if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) {
      // Try space separator
      const spaceParts = line.split(/\s+/);
      if (spaceParts.length < 2) {
        return `Invalid format on line ${i + 1}. Use UPC,Qty format.`;
      }
      const qty = Number(spaceParts[spaceParts.length - 1]);
      if (isNaN(qty) || qty <= 0) {
        return `Invalid quantity on line ${i + 1}.`;
      }
      continue;
    }
    const qty = Number(parts[1].trim());
    if (isNaN(qty) || qty <= 0) {
      return `Invalid quantity on line ${i + 1}. Qty must be > 0.`;
    }
  }
  return null;
}

export default function BulkOrder() {
  const config = activeBrandConfig;
  const { addItems } = useOrder();
  const { message } = App.useApp();
  const { user, isAuthenticated } = useAuth();
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [entries, setEntries] = useState<OrderEntry[]>([...EMPTY_ROWS]);
  const [pasteText, setPasteText] = useState("");
  const [lastSource, setLastSource] = useState<Source>(null);
  const [lineErrors, setLineErrors] = useState<EntryError[]>([]);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [upcErrors, setUpcErrors] = useState<string[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<{ current: number; total: number } | null>(null);

  // Sync: lines → textarea (debounced)
  useEffect(() => {
    if (lastSource !== "lines") return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    syncTimerRef.current = setTimeout(() => {
      const { errors } = validateEntries(entries);
      setLineErrors(errors);
      const validEntries = entries.filter((e, i) => {
        const hasCode = e.itemCode.trim().length > 0;
        const hasQty = e.quantity.trim().length > 0;
        if (!hasCode && !hasQty) return false;
        return !errors.some((err) => err.row === i);
      });
      setPasteText(entriesToText(validEntries));
      setPasteError(null);
      setUpcErrors([]);
    }, 500);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [entries, lastSource]);

  // Sync: textarea → lines (debounced)
  useEffect(() => {
    if (lastSource !== "paste") return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    syncTimerRef.current = setTimeout(() => {
      const error = validatePasteText(pasteText);
      setPasteError(error);
      if (!error) {
        const parsed = textToEntries(pasteText);
        setEntries(parsed.length > 0 ? parsed : [...EMPTY_ROWS]);
        setLineErrors([]);
        setUpcErrors([]);
      }
    }, 500);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [pasteText, lastSource]);

  const handleLinesUpdate = useCallback((updated: OrderEntry[]) => {
    setEntries(updated);
  }, []);

  const handleLinesFocus = useCallback(() => {
    setLastSource("lines");
  }, []);

  const handlePasteChange = useCallback((value: string) => {
    setPasteText(value);
  }, []);

  const handlePasteFocus = useCallback(() => {
    setLastSource("paste");
  }, []);

  // Count valid entries for CTA state
  const { validCount } = validateEntries(entries);

  // ── Add to Cart handler (with API fetching) ────────────────
  const handleAddToCart = useCallback(async () => {
    setUpcErrors([]);
    setIsAddingToCart(true);
    setFetchProgress(null);

    try {
      // Gather valid entries and aggregate duplicate UPCs
      const upcMap = new Map<string, number>();
      for (const entry of entries) {
        const upc = entry.itemCode.trim();
        const qty = Number(entry.quantity);
        if (!upc || isNaN(qty) || qty <= 0) continue;
        upcMap.set(upc, (upcMap.get(upc) || 0) + qty);
      }

      const totalUpcs = upcMap.size;
      if (totalUpcs === 0) {
        message.warning("No valid items to add");
        setIsAddingToCart(false);
        return;
      }

      const notFound: string[] = [];
      const fetchedProducts: Array<{
        upc: string;
        quantity: number;
        productData: ReturnType<typeof transformProductResponse>;
      }> = [];
      let currentIndex = 0;

      // Step 1: Fetch all product details
      for (const [upc, qty] of upcMap) {
        currentIndex++;
        setFetchProgress({ current: currentIndex, total: totalUpcs });

        try {
          const productResponse = await fetchProductByUpc(upc);
          const productData = transformProductResponse(productResponse);
          fetchedProducts.push({ upc, quantity: qty, productData });
        } catch (error) {
          console.error(`Failed to fetch product ${upc}:`, error);
          notFound.push(upc);
        }
      }

      // Step 2: Fetch prices for all successfully fetched products in ONE API call
      const itemsToAdd: Parameters<typeof addItems>[0] = [];
      
      if (fetchedProducts.length > 0) {
        setFetchProgress({ current: totalUpcs, total: totalUpcs });
        
        try {
          // Build price request payload for all products
          const priceRequestItems: PriceRequestItem[] = fetchedProducts.map(({ upc }) => {
            const priceItem: PriceRequestItem = {
              upc,
              channelCode: apiConfig.priceChannelCode,
            };
            
            if (isAuthenticated && user?.accountId) {
              priceItem.accoundId = parseInt(user.accountId, 10);
            }
            
            return priceItem;
          });

          // Single batch pricing API call
          const priceResponse = await fetchBestPrices(priceRequestItems);

          // Step 3: Combine product data with pricing and prepare cart items
          for (const { upc, quantity, productData } of fetchedProducts) {
            const priceInfo = priceResponse.productPrice[upc];
            const unitPrice = priceInfo ? Number(priceInfo.listPrice) : 0;
            const originalPrice = priceInfo ? Number(priceInfo.basePrice) : undefined;

            itemsToAdd.push({
              id: productData.id,
              productId: productData.id,
              productName: productData.name,
              upc: productData.upcId,
              variantAttributes: {},
              quantity,
              unitPrice,
              originalPrice,
              imageUrl: productData.imageUrl,
            });
          }
        } catch (error) {
          console.error("Failed to fetch prices:", error);
          // If pricing fails, add items with 0 price
          for (const { quantity, productData } of fetchedProducts) {
            itemsToAdd.push({
              id: productData.id,
              productId: productData.id,
              productName: productData.name,
              upc: productData.upcId,
              variantAttributes: {},
              quantity,
              unitPrice: 0,
              imageUrl: productData.imageUrl,
            });
          }
        }
      }

      // Add valid items to cart
      if (itemsToAdd.length > 0) {
        addItems(itemsToAdd);
      }

      // Handle results
      if (notFound.length > 0) {
        setUpcErrors(notFound);
      }

      if (itemsToAdd.length > 0 && notFound.length > 0) {
        message.warning({
          content: `${itemsToAdd.length} item${itemsToAdd.length !== 1 ? "s" : ""} added. ${notFound.length} UPC${notFound.length !== 1 ? "s" : ""} not found.`,
          duration: 4,
        });
      } else if (itemsToAdd.length > 0) {
        // Clear form on full success
        setEntries([...EMPTY_ROWS]);
        setPasteText("");
        message.success(`${itemsToAdd.length} item${itemsToAdd.length !== 1 ? "s" : ""} added to cart!`);
      } else if (notFound.length > 0) {
        message.error({
          content: `No valid UPCs found. ${notFound.length} UPC${notFound.length !== 1 ? "s" : ""} not recognized.`,
          duration: 4,
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      message.error("An error occurred while adding items to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
      setFetchProgress(null);
    }
  }, [entries, addItems, message, isAuthenticated, user?.accountId]);

  return (
    <div className="max-w-content mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Bulk Order
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
          Enter item codes (UPCs) and quantities to add directly to your cart.
          Valid items are added immediately — no preview step required.
        </p>
        <p
          className="text-xs mt-2 flex items-center gap-1.5"
          style={{ color: config.secondaryColor }}
        >
          <SyncOutlined className="text-[11px]" />
          Entries added in one section will automatically reflect in the other.
        </p>
      </div>

      {/* Two-Column Layout */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <LineByLinePanel
            entries={entries}
            errors={lineErrors}
            onUpdate={handleLinesUpdate}
            onFocus={handleLinesFocus}
          />
        </Col>
        <Col xs={24} lg={12}>
          <PastePanel
            value={pasteText}
            onChange={handlePasteChange}
            onFocus={handlePasteFocus}
            error={pasteError}
          />
        </Col>
      </Row>

      {/* UPC Error Messages */}
      {upcErrors.length > 0 && (
        <div
          className="mt-4 rounded-lg px-4 py-3"
          style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: "#991B1B" }}>
            {upcErrors.length} UPC{upcErrors.length !== 1 ? "s" : ""} not found:
          </p>
          <div className="flex flex-wrap gap-2">
            {upcErrors.map((upc) => (
              <span
                key={upc}
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
              >
                {upc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 flex items-center justify-between">
        <span className="text-sm" style={{ color: config.secondaryColor }}>
          {isAddingToCart && fetchProgress ? (
            <span className="flex items-center gap-2">
              <LoadingOutlined className="text-base" />
              Fetching product {fetchProgress.current} of {fetchProgress.total}...
            </span>
          ) : validCount > 0 ? (
            `${validCount} valid item${validCount !== 1 ? "s" : ""} ready to add`
          ) : (
            "No valid items entered yet"
          )}
        </span>
        <Button
          type="primary"
          size="large"
          icon={isAddingToCart ? <LoadingOutlined /> : <ShoppingCartOutlined />}
          disabled={validCount === 0 || isAddingToCart}
          loading={isAddingToCart}
          onClick={handleAddToCart}
          style={{
            height: 44,
            paddingLeft: 28,
            paddingRight: 28,
            fontWeight: 600,
            borderRadius: 8,
            backgroundColor: validCount > 0 && !isAddingToCart ? config.primaryColor : undefined,
          }}
        >
          {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
