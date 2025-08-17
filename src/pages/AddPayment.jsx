import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { FaUser, FaMoneyBillWave, FaCalendarAlt, FaSave, FaTimes } from "react-icons/fa";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AddPayment() {
  const nav = useNavigate();
  const q = useQuery();
  const preselected = q.get("clientId") || "";

  const [form, setForm] = useState({
    clientId: preselected,
    amount: "",
    date: new Date().toISOString().slice(0,10),
    description: ""
  });
  
  const [err, setErr] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientStats, setClientStats] = useState({ total: 0, paid: 0, debt: 0 });

  // Fetch clients from Firestore
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => a.fullName.localeCompare(b.fullName));
        
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients: ", error);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // Fetch client stats when selected
  useEffect(() => {
    if (!form.clientId) return;

    const fetchClientStats = async () => {
      try {
        // Fetch rentals
        const rentalsQuery = query(
          collection(db, "rentals"),
          where("clientId", "==", form.clientId)
        );
        const rentalsSnapshot = await getDocs(rentalsQuery);
        const rentalsData = rentalsSnapshot.docs.map(doc => doc.data());
        
        // Fetch payments
        const paymentsQuery = query(
          collection(db, "payments"),
          where("clientId", "==", form.clientId)
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData = paymentsSnapshot.docs.map(doc => doc.data());

        // Calculate stats
        const total = rentalsData.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
        const paid = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        setClientStats({ 
          total, 
          paid, 
          debt: total - paid 
        });
      } catch (error) {
        console.error("Error fetching client stats:", error);
      }
    };

    fetchClientStats();
  }, [form.clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.clientId) errors.clientId = "Mijozni tanlang";
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
      const paymentData = {
        clientId: form.clientId,
        amount: Number(form.amount),
        date: form.date,
        description: form.description,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "payments"), paymentData);
      
      nav(`/clients/${form.clientId}`, { 
        state: { 
          success: true,
          message: "To'lov muvaffaqiyatli qo'shildi" 
        } 
      });
    } catch (error) {
      console.error("Error adding payment: ", error);
      alert("Xatolik yuz berdi. Iltimos, qaytadan urunib ko'ring.");
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
          <div className="space-y-2">
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaUser className="text-emerald-600" />
              Mijoz *
            </label>
            {loadingClients ? (
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mijozlar yuklanmoqda...
              </div>
            ) : (
              <>
                <select
                  id="clientId"
                  name="clientId"
                  className={`input ${err.clientId ? 'border-red-500' : 'border-gray-300'}`}
                  value={form.clientId} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">— Tanlang —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
                {err.clientId && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {err.clientId}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Client Stats */}
          {form.clientId && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs font-medium text-gray-500">Umumiy summa</div>
                <div className="text-lg font-bold text-emerald-700 mt-1">
                  {clientStats.total.toLocaleString()} so'm
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs font-medium text-gray-500">To'langan</div>
                <div className="text-lg font-bold text-blue-700 mt-1">
                  {clientStats.paid.toLocaleString()} so'm
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${clientStats.debt > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-xs font-medium text-gray-500">Qolgan qarz</div>
                <div className={`text-lg font-bold mt-1 ${clientStats.debt > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                  {clientStats.debt.toLocaleString()} so'm
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-600" />
              To'langan summa (so'm) *
            </label>
            <input
              id="amount"
              name="amount"
              type="number" 
              min="1"
              className={`input ${err.amount ? 'border-red-500' : 'border-gray-300'}`}
              value={form.amount} 
              onChange={handleChange}
              placeholder="0"
              disabled={isSubmitting}
            />
            {err.amount && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {err.amount}
              </p>
            )}
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-600" />
              Sana *
            </label>
            <input
              id="date"
              name="date"
              type="date" 
              className={`input ${err.date ? 'border-red-500' : 'border-gray-300'}`}
              value={form.date} 
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {err.date && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {err.date}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Izoh (ixtiyoriy)
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="input"
              value={form.description} 
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="To'lov haqida qo'shimcha ma'lumot..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => nav(-1)} 
              className="btn-secondary"
              disabled={isSubmitting}
            >
              <FaTimes className="mr-2" />
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Saqlash
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}