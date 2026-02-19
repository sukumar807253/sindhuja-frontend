import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

// ✅ API URL
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Collection() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Receive data from Members page
  const initialMembers = location.state?.collection ?? [];

  const [members, setMembers] = useState(
    initialMembers.map(m => ({
      ...m,
      manualAmount: Number(m.amount) || 0
    }))
  );

  const denominationOrder = [2000, 500, 200, 100, 50, 20, 10];

  const [notes, setNotes] = useState(
    denominationOrder.reduce((acc, note) => {
      acc[note] = 0;
      return acc;
    }, {})
  );

  /* ================= UPDATE MEMBER AMOUNT ================= */
  const updateAmount = (id, value) => {
    const amt = value === "" ? 0 : Number(value);

    setMembers(prev =>
      prev.map(m =>
        m.member_id === id ? { ...m, manualAmount: amt } : m
      )
    );
  };

  /* ================= TOTAL COLLECTION ================= */
  const totalCollection = members.reduce(
    (sum, m) => sum + (Number(m.manualAmount) || 0),
    0
  );

  /* ================= TOTAL NOTES VALUE ================= */
  const totalNotes = denominationOrder.reduce(
    (sum, note) => sum + note * (Number(notes[note]) || 0),
    0
  );

  /* ================= SAVE COLLECTION ================= */
  const saveCollection = async () => {
    // 🔒 Prevent double click
    if (loading) return;

    if (members.length === 0) {
      alert("❌ No members found");
      return;
    }

    if (totalNotes !== totalCollection) {
      alert(`❌ Denomination mismatch: ₹${totalNotes} vs ₹${totalCollection}`);
      return;
    }

    try {
      setLoading(true);

      // ✅ Only send members with amount > 0
      const payload = members
        .filter(m => Number(m.manualAmount) > 0)
        .map(m => ({
          member_id: m.member_id,
          loan_id: m.loan_id,
          week_no: m.week_no,
          amount: Number(m.manualAmount),
          status: "paid"
        }));

      if (payload.length === 0) {
        alert("❌ No payment entered");
        setLoading(false);
        return;
      }

      await axios.post(
        `${API}/collections/pay-batch`,
        {
          collection: payload,
          denomination: notes
        },
        { timeout: 15000 } // 15s timeout
      );

      alert("✅ Collection saved successfully");

      navigate(-1); // go back safely
    } catch (err) {
      console.error("Save Error:", err);

      alert(
        err?.response?.data?.message ||
          "❌ Failed to save collection. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Collection</h2>

      <p className="mb-3 font-semibold text-green-700">
        Total Collection Amount: ₹ {totalCollection}
      </p>

      <h3 className="font-semibold mt-4 mb-2">Denominations</h3>

      {denominationOrder.map(note => (
        <div key={note} className="flex justify-between items-center mb-2">
          <span className="font-medium">₹ {note}</span>

          <input
            type="number"
            min="0"
            value={notes[note] === 0 ? "" : notes[note]}
            onChange={e =>
              setNotes(prev => ({
                ...prev,
                [note]:
                  e.target.value === "" ? 0 : Number(e.target.value)
              }))
            }
            className="w-20 border p-1 rounded text-right"
          />
        </div>
      ))}

      <p
        className={`font-bold mt-4 ${
          totalNotes === totalCollection
            ? "text-green-700"
            : "text-red-600"
        }`}
      >
        Total Notes Value: ₹ {totalNotes}
      </p>

      <button
        onClick={saveCollection}
        disabled={loading}
        className={`mt-4 w-full py-2 rounded text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "Saving..." : "Save Collection"}
      </button>
    </div>
  );
}
