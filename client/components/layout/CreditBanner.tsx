import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useCreditState } from "../../hooks/useCreditState";

export default function CreditBanner() {
  const { isExceeded } = useCreditState();

  if (!isExceeded) return null;

  return (
    <div
      className="w-full px-4 py-2.5 text-center text-white text-sm font-medium flex items-center justify-center gap-2"
      style={{ backgroundColor: "#DC2626", zIndex: 60 }}
    >
      <ExclamationCircleOutlined />
      You have exceeded your available credit limit. Remove items from the cart
      or clear outstanding dues to place the next order.
    </div>
  );
}
