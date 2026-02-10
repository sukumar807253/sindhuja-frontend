import { useEffect, useState } from "react";
import axios from "axios";

// ✅ Production-ready API URL
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function UnpaidMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUnpaidMembers = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`${API}/collections/unpaid-mobile`);

        // Ensure res.data is an array
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setMembers(data);
      } catch (err) {
        console.error("Failed to fetch unpaid members:", err);
        setError(err?.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidMembers();
  }, []);

  /* ================= LOADING / ERROR / EMPTY ================= */
  if (loading) return <p className="p-6 text-gray-600">Loading unpaid members...</p>;
  if (error) return <p className="p-6 text-red-600 font-semibold">{error}</p>;
  if (!members.length) return <p className="p-6">No unpaid members found today.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Unpaid Members Today</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Center</th>
              <th className="border p-2 text-left">Member</th>
              <th className="border p-2 text-right">Expected</th>
              <th className="border p-2 text-right">Paid</th>
              <th className="border p-2 text-right">Due</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.schedule_id} className="hover:bg-gray-50">
                <td className="border p-2">{m.center_name || "-"}</td>
                <td className="border p-2">{m.member_name || "-"}</td>
                <td className="border p-2 text-right">{m.expected_amount ?? 0}</td>
                <td className="border p-2 text-right">{m.paid_amount ?? 0}</td>
                <td className="border p-2 text-right">{m.amount_due ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
