import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Production-ready API URL
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function MemberDetails() {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loadingMember, setLoadingMember] = useState(true);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [errorMember, setErrorMember] = useState("");
  const [errorLoans, setErrorLoans] = useState("");

  /* ================= FETCH MEMBER ================= */
  useEffect(() => {
    const fetchMember = async () => {
      setLoadingMember(true);
      setErrorMember("");

      try {
        const res = await axios.get(`${API}/member/${memberId}`);
        setMember(res.data || null);
      } catch (err) {
        console.error("Failed to fetch member", err);
        setErrorMember("Failed to load member details");
      } finally {
        setLoadingMember(false);
      }
    };

    fetchMember();
  }, [memberId]);

  /* ================= FETCH LOANS ================= */
  useEffect(() => {
    const fetchLoans = async () => {
      setLoadingLoans(true);
      setErrorLoans("");

      try {
        const res = await axios.get(`${API}/collections/${memberId}`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setLoans(data);
      } catch (err) {
        console.error("Failed to fetch loans", err);
        setErrorLoans("Failed to load loan/collection details");
      } finally {
        setLoadingLoans(false);
      }
    };

    fetchLoans();
  }, [memberId]);

  /* ================= LOADING / ERROR ================= */
  if (loadingMember) return <div className="p-6">Loading member details...</div>;
  if (errorMember) return <div className="p-6 text-red-600">{errorMember}</div>;
  if (!member) return <div className="p-6">No member found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        className="mb-4 text-blue-500 hover:underline"
        onClick={() => navigate(-1)}
      >
        &larr; Back
      </button>

      <h2 className="text-2xl font-bold mb-4">{member.name}'s Loan Details</h2>
      <p>Email: {member.email || "N/A"}</p>
      <p>Phone: {member.phone || "N/A"}</p>

      <h3 className="text-xl font-semibold mt-6 mb-2">Loans & Collections</h3>

      {loadingLoans ? (
        <p>Loading loans...</p>
      ) : errorLoans ? (
        <p className="text-red-600">{errorLoans}</p>
      ) : loans.length === 0 ? (
        <p>No loans found for this member.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Released Date</th>
              <th className="border px-4 py-2">Loan Start Date</th>
              <th className="border px-4 py-2">Repayment Day</th>
              <th className="border px-4 py-2">Last Collected</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id}>
                <td className="border px-4 py-2">{l.amount ?? "-"}</td>
                <td className="border px-4 py-2">{l.released_date ?? "-"}</td>
                <td className="border px-4 py-2">{l.loan_start_date ?? "-"}</td>
                <td className="border px-4 py-2">{l.repayment_day ?? "-"}</td>
                <td className="border px-4 py-2">{l.last_collected ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
