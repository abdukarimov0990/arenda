import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useStore } from "../store.jsx";
import { FaUser, FaMoneyBillWave, FaCalendarAlt, FaSave, FaTimes } from "react-icons/fa";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AddPayment() {
  const { clients, clientStats, addPayment } = useStore();
  const nav = useNavigate();
  const q = useQuery();
  const preselected = q.get("clientId") || "";

  const [form, setForm] = useState({
    clientId: preselected,
    amount: "",
    date: new Date().toISOString().slice(0,10)
  });
  const [err, setErr] = useState({});

  const statsById = useMemo(() => {
    const map = {};
    clientStats.forEach(s => map[s.clientId] = s);
    return map;
  }, [clientStats]);

  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.clientId) e.clientId = "Mijozni tanlang";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Summani to'g'ri kiriting";
    if (!form.date) e.date = "Sanani kiriting";
    setErr(e); 
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    addPayment({ 
      clientId: form.clientId, 
      amount: Number(form.amount), 
      date: form.date 
    });
    nav(`/clients/${form.clientId}`);
  };

  const selStats = statsById[form.clientId] || { total: 0, paid: 0, debt: 0 };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
        <FaMoneyBillWave className="text-emerald-600" />
        To'lov qo'shish
      </h2>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaUser className="text-emerald-600" />
              Mijoz *
            </label>
            <select 
              className={`input ${err.clientId ? 'border-red-500' : 'border-gray-300'}`}
              value={form.clientId} 
              onChange={e => onChange("clientId", e.target.value)}
            >
              <option value="">— Tanlang —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
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
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoCard 
              label="Umumiy" 
              value={selStats.total.toLocaleString() + " so'm"} 
              bgColor="bg-emerald-50" 
              textColor="text-emerald-700"
            />
            <InfoCard 
              label="To'langan" 
              value={selStats.paid.toLocaleString() + " so'm"} 
              bgColor="bg-blue-50" 
              textColor="text-blue-700"
            />
            <InfoCard 
              label="Qolgan qarz" 
              value={selStats.debt.toLocaleString() + " so'm"} 
              bgColor="bg-amber-50" 
              textColor="text-amber-700"
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-600" />
              To'langan summa (so'm) *
            </label>
            <input 
              className={`input ${err.amount ? 'border-red-500' : 'border-gray-300'}`}
              type="number" 
              min="1" 
              value={form.amount} 
              onChange={e => onChange("amount", e.target.value)}
              placeholder="0"
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
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-600" />
              Sana *
            </label>
            <input 
              className={`input ${err.date ? 'border-red-500' : 'border-gray-300'}`}
              type="date" 
              value={form.date} 
              onChange={e => onChange("date", e.target.value)}
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              onClick={() => nav(-1)} 
              className="btn-secondary"
            >
              <FaTimes className="mr-2" />
              Bekor qilish
            </button>
            <button 
              onClick={submit} 
              className="btn-primary"
            >
              <FaSave className="mr-2" />
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Info Card Component
function InfoCard({ label, value, bgColor = "bg-gray-50", textColor = "text-gray-700" }) {
  return (
    <div className={`${bgColor} p-4 rounded-lg border border-gray-200`}>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className={`text-lg font-bold mt-1 ${textColor}`}>{value}</div>
    </div>
  );
}