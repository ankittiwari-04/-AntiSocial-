import { useState } from "react";
import API from "../api/axios";

export default function TipModal({ receiverId, receiverName, onClose }) {
  const [amount, setAmount] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleTip = async () => {
    setLoading(true);
    try {
      const res = await API.post("/payments/tip", { receiverId, amount });
      const { orderId, keyId } = res.data;
      const rzp = new window.Razorpay({
        key: keyId,
        amount: amount * 100,
        currency: "INR",
        name: "AntiSocial",
        description: `Tip to @${receiverName}`,
        order_id: orderId,
        handler: async (response) => {
          await API.post("/payments/verify", {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          window.alert(`Sent ₹${amount} to @${receiverName}`);
          onClose();
        },
      });
      rzp.open();
    } catch {
      window.alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        className="w-[340px] animate-fade-in rounded-2xl border border-dark-700 bg-dark-800 p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="mb-4 text-center text-lg font-semibold text-white">Tip @{receiverName}</h3>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {[10, 50, 100, 200].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(v)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                amount === v
                  ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-glow-sm"
                  : "border border-dark-500 text-[#a1a1aa] hover:border-brand-500/40"
              }`}
            >
              ₹{v}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value || 0))}
          className="input-field mb-4 text-center text-lg font-bold"
        />
        <button
          type="button"
          onClick={handleTip}
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Processing…" : `Send ₹${amount}`}
        </button>
        <button type="button" onClick={onClose} className="mt-3 w-full text-center text-sm text-[#71717a] hover:text-white">
          Cancel
        </button>
      </div>
    </div>
  );
}
