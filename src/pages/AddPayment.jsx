import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { db } from "../../config/firebase";
import { 
  collection, addDoc, serverTimestamp, getDocs, query, where 
} from "firebase/firestore";
import { 
  FaUser, FaMoneyBillWave, FaCalendarAlt, FaSave, FaTimes, FaBox 
} from "react-icons/fa";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AddPayment() {
  const nav = useNavigate();
  const q = useQuery();
  const preselectedClient = q.get("clientId") || "";

  const [form, setForm] = useState({
    clientId: preselectedClient,
    rentalId: "",
    amount: "",
    date: new Date().toISOString().slice(0,10),
    description: ""
  });
  
  const [err, setErr] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clients, setClients] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingRentals, setLoadingRentals] = useState(false);

  const [stats, setStats] = useState({ total: 0, paid: 0, debt: 0 });
  const [rentalStats, setRentalStats] = useState({ total: 0, paid: 0, debt: 0 });

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const snapshot = await getDocs(collection(db, "clients"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.fullName.localeCompare(b.fullName));
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  // Fetch rentals when client selected
  useEffect(() => {
    if (!form.clientId) return;
    const fetchRentals = async () => {
      setLoadingRentals(true);
      try {
        const rentalQuery = query(
          collection(db, "rentals"),
          where("clientId", "==", form.clientId)
        );
        const rentalSnap = await getDocs(rentalQuery);
        const rentalData = rentalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRentals(rentalData);

        // Stats for all rentals of client
        const total = rentalData.reduce((s, r) => s + (r.totalPrice || 0), 0);
        const paymentsQuery = query(
          collection(db, "payments"),
          where("clientId", "==", form.clientId)
        );
        const paymentsSnap = await getDocs(paymentsQuery);
        const paid = paymentsSnap.docs.reduce((s, p) => s + (p.data().amount || 0), 0);

        setStats({ total, paid, debt: total - paid });
      } catch (err) {
        console.error("Error fetching rentals:", err);
      } finally {
        setLoadingRentals(false);
      }
    };
    fetchRentals();
  }, [form.clientId]);

  // Fetch rental-specific stats
  useEffect(() => {
    if (!form.rentalId) return;
    const fetchRentalStats = async () => {
      try {
        const rental = rentals.find(r => r.id === form.rentalId);
        if (!rental) return;

        const paymentsQuery = query(
          collection(db, "payments"),
          where("rentalId", "==", form.rentalId)
        );
        const snap = await getDocs(paymentsQuery);
        const paid = snap.docs.reduce((s, p) => s + (p.data().amount || 0), 0);

        setRentalStats({ 
          total: rental.totalPrice || 0,
          paid,
          debt: (rental.totalPrice || 0) - paid
        });
      } catch (error) {
        console.error("Error fetching rental stats:", error);
      }
    };
    fetchRentalStats();
  }, [form.rentalId, rentals]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.clientId) errors.clientId = "Mijozni tanlang";
    if (!form.rentalId) errors.rentalId = "Mahsulotni tanlang";
    if (!form.amount || Number(form.amount) <= 0) errors.amount = "Summani to'g'ri kiriting";
    if (!form.date) errors.date = "Sanani kiriting";
    setErr(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "payments"), {
        clientId: form.clientId,
        rentalId: form.rentalId,
        amount: Number(form.amount),
        date: form.date,
        description: form.description,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      nav(`/clients/${form.clientId}`, {
        state: { success: true, message: "To'lov qo'shildi" }
      });
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
        <FaMoneyBillWave className="text-emerald-600" />
        To'lov qo'shish
      </h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 space-y-6">

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaUser className="text-emerald-600" /> Mijoz *
            </label>
            <select
              name="clientId"
              className="input"
              value={form.clientId}
              onChange={handleChange}
              disabled={isSubmitting || loadingClients}
            >
              <option value="">— Tanlang —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
            {err.clientId && <p className="text-red-600 text-sm">{err.clientId}</p>}
          </div>

          {/* Rental Selection */}
          {form.clientId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaBox className="text-emerald-600" /> Mahsulot *
              </label>
              <select
                name="rentalId"
                className="input"
                value={form.rentalId}
                onChange={handleChange}
                disabled={isSubmitting || loadingRentals}
              >
                <option value="">— Tanlang —</option>
                {rentals.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.productName} ({r.totalPrice?.toLocaleString()} so'm)
                  </option>
                ))}
              </select>
              {err.rentalId && <p className="text-red-600 text-sm">{err.rentalId}</p>}
            </div>
          )}

          {/* Stats */}
          {form.clientId && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500">Mijoz umumiy summa</div>
                <div className="text-lg font-bold text-emerald-700">{stats.total.toLocaleString()} so'm</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500">To'langan</div>
                <div className="text-lg font-bold text-blue-700">{stats.paid.toLocaleString()} so'm</div>
              </div>
              <div className={`p-4 rounded-lg ${stats.debt>0?'bg-red-50':'bg-gray-50'}`}>
                <div className="text-xs text-gray-500">Qolgan qarz</div>
                <div className={`text-lg font-bold ${stats.debt>0?'text-red-700':'text-gray-700'}`}>
                  {stats.debt.toLocaleString()} so'm
                </div>
              </div>
            </div>
          )}

          {form.rentalId && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-100 p-4 rounded-lg">
                <div className="text-xs text-gray-600">Mahsulot narxi</div>
                <div className="text-lg font-bold">{rentalStats.total.toLocaleString()} so'm</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="text-xs text-gray-600">To'langan</div>
                <div className="text-lg font-bold">{rentalStats.paid.toLocaleString()} so'm</div>
              </div>
              <div className={`p-4 rounded-lg ${rentalStats.debt>0?'bg-red-100':'bg-green-100'}`}>
                <div className="text-xs text-gray-600">Qolgan</div>
                <div className="text-lg font-bold">{rentalStats.debt.toLocaleString()} so'm</div>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-600" /> To'lov (so'm) *
            </label>
            <input
              type="number"
              name="amount"
              className="input"
              value={form.amount}
              onChange={handleChange}
              disabled={isSubmitting}
              min="1"
            />
            {err.amount && <p className="text-red-600 text-sm">{err.amount}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-600" /> Sana *
            </label>
            <input
              type="date"
              name="date"
              className="input"
              value={form.date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {err.date && <p className="text-red-600 text-sm">{err.date}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Izoh</label>
            <textarea
              name="description"
              className="input"
              rows="3"
              value={form.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" className="btn-secondary" onClick={()=>nav(-1)} disabled={isSubmitting}>
              <FaTimes className="mr-1" /> Bekor qilish
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saqlanmoqda..." : (<><FaSave className="mr-1"/> Saqlash</>)}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
