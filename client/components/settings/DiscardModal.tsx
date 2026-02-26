import { activeBrandConfig } from "../../config/brandConfig";

interface Props {
  open: boolean;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function DiscardModal({ open, onDiscard, onCancel }: Props) {
  const config = activeBrandConfig;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-xl p-6 w-full max-w-sm"
        style={{ backgroundColor: "#fff", border: `1px solid ${config.borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold m-0 mb-2" style={{ color: config.primaryColor }}>
          Discard unsaved changes?
        </h3>
        <p className="text-sm m-0 mb-6" style={{ color: config.secondaryColor }}>
          You have unsaved changes that will be lost if you switch tabs.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm font-medium px-4 py-2 rounded-lg cursor-pointer"
            style={{
              backgroundColor: "#fff",
              color: config.primaryColor,
              border: `1px solid ${config.borderColor}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onDiscard}
            className="text-sm font-medium px-4 py-2 rounded-lg cursor-pointer text-white border-none"
            style={{ backgroundColor: "#DC2626" }}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
