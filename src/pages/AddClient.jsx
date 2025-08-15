import { useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "../store.jsx";
import { 
  FaUser, FaPhone, FaIdCard, FaMapMarkerAlt, 
  FaBox, FaTags, FaRuler, FaCalculator, 
  FaCalendarAlt, FaMoneyBillWave, FaSave, FaTimes 
} from "react-icons/fa";

export default function AddClient() {
  const { addClient, setRentals } = useStore();
  const nav = useNavigate();

  const [form, setForm] = useState({
    fullName: "", phone: "", passportId: "", address: "",
    productName: "", productType: "", productSize: "",
    quantity: "", dailyPrice: "", startDate: "", endDate: "", totalDays: "", totalPrice: 0
  });
  const [err, setErr] = useState({});

  const onChange = (k, v) => {
    setForm(prev => {
      let updated = { ...prev, [k]: v };

      // Calculate days
      if (k === "startDate" || k === "endDate") {
        if (updated.startDate && updated.endDate) {
          const diff = (new Date(updated.endDate) - new Date(updated.startDate)) / (1000 * 60 * 60 * 24);
          updated.totalDays = diff > 0 ? diff : 0;
        }
      }

      // Calculate total price
      if (updated.quantity && updated.dailyPrice && updated.totalDays) {
        updated.totalPrice = Number(updated.quantity) * Number(updated.dailyPrice) * Number(updated.totalDays);
      }

      return updated;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Majburiy maydon";
    if (!form.phone.trim()) e.phone = "Majburiy maydon";
    if (!form.passportId.trim()) e.passportId = "Majburiy maydon";
    if (!form.address.trim()) e.address = "Majburiy maydon";
    if (!form.productName.trim()) e.productName = "Majburiy maydon";
    if (!form.productType.trim()) e.productType = "Majburiy maydon";
    if (!form.productSize.trim()) e.productSize = "Majburiy maydon";
    if (!form.quantity) e.quantity = "Majburiy maydon";
    if (!form.dailyPrice) e.dailyPrice = "Majburiy maydon";
    if (!form.startDate) e.startDate = "Majburiy maydon";
    if (!form.endDate) e.endDate = "Majburiy maydon";
    setErr(e); 
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const clientId = crypto.randomUUID();
    addClient({
      id: clientId,
      fullName: form.fullName,
      phone: form.phone,
      passportId: form.passportId,
      address: form.address
    });
    setRentals(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        clientId,
        productName: form.productName,
        productType: form.productType,
        productSize: form.productSize,
        quantity: Number(form.quantity),
        dailyPrice: Number(form.dailyPrice),
        totalDays: Number(form.totalDays),
        totalPrice: Number(form.totalPrice),
        paymentDueDate: form.endDate,
        status: "active"
      }
    ]);
    nav("/");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-emerald-800">Yangi mijoz va ijara qo'shish</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 space-y-8">
          {/* Client Information Section */}
          <Section 
            title="Mijoz ma'lumotlari" 
            icon={<FaUser className="text-emerald-600" />}
          >
            <Field label="Ism va familiya" error={err.fullName} icon={<FaUser />}>
              <input 
                className={`input ${err.fullName ? 'border-red-500' : 'border-gray-300'}`}
                value={form.fullName} 
                onChange={e => onChange("fullName", e.target.value)}
                placeholder="To'liq ism sharifi"
              />
            </Field>
            
            <Field label="Telefon raqami" error={err.phone} icon={<FaPhone />}>
              <input 
                className={`input ${err.phone ? 'border-red-500' : 'border-gray-300'}`}
                value={form.phone} 
                onChange={e => onChange("phone", e.target.value)}
                placeholder="99890xxxxxxx"
              />
            </Field>
            
            <Field label="Pasport yoki ID raqami" error={err.passportId} icon={<FaIdCard />}>
              <input 
                className={`input ${err.passportId ? 'border-red-500' : 'border-gray-300'}`}
                value={form.passportId} 
                onChange={e => onChange("passportId", e.target.value)}
                placeholder="AA1234567"
              />
            </Field>
            
            <Field label="Manzil (ijara manzili)" error={err.address} icon={<FaMapMarkerAlt />}>
              <input 
                className={`input ${err.address ? 'border-red-500' : 'border-gray-300'}`}
                value={form.address} 
                onChange={e => onChange("address", e.target.value)}
                placeholder="To'liq manzil"
              />
            </Field>
          </Section>

          {/* Rental Information Section */}
          <Section 
            title="Ijara ma'lumotlari" 
            icon={<FaBox className="text-emerald-600" />}
          >
            <Field label="Mahsulot nomi" error={err.productName} icon={<FaBox />}>
              <input 
                className={`input ${err.productName ? 'border-red-500' : 'border-gray-300'}`}
                value={form.productName} 
                onChange={e => onChange("productName", e.target.value)}
                placeholder="Mahsulot nomi"
              />
            </Field>
            
            <Field label="Mahsulot turi" error={err.productType} icon={<FaTags />}>
              <select
                className={`input ${err.productType ? 'border-red-500' : 'border-gray-300'}`}
                value={form.productType}
                onChange={e => onChange("productType", e.target.value)}
              >
                <option value="">Tanlang</option>
                <option value="Lesa">Lesa</option>
                <option value="Stoyka">Stoyka</option>
                <option value="Apilafka">Apilafka</option>
                <option value="Boshqa">Boshqa</option>
              </select>
            </Field>
            
            <Field label="Mahsulot razmeri" error={err.productSize} icon={<FaRuler />}>
              <select
                className={`input ${err.productSize ? 'border-red-500' : 'border-gray-300'}`}
                value={form.productSize}
                onChange={e => onChange("productSize", e.target.value)}
              >
                <option value="">Tanlang</option>
                <option value="3m">3 metr</option>
                <option value="6m">6 metr</option>
                <option value="9m">9 metr</option>
                <option value="12m">12 metr</option>
              </select>
            </Field>
            
            <Field label="Berilgan soni" error={err.quantity} icon={<FaCalculator />}>
              <input 
                type="number" 
                className={`input ${err.quantity ? 'border-red-500' : 'border-gray-300'}`}
                value={form.quantity} 
                onChange={e => onChange("quantity", e.target.value)}
                min="1"
              />
            </Field>
            
            <Field label="Bir kunlik narxi (so'm)" error={err.dailyPrice} icon={<FaMoneyBillWave />}>
              <input 
                type="number" 
                className={`input ${err.dailyPrice ? 'border-red-500' : 'border-gray-300'}`}
                value={form.dailyPrice} 
                onChange={e => onChange("dailyPrice", e.target.value)}
                min="0"
              />
            </Field>
            
            <Field label="Boshlanish sanasi" error={err.startDate} icon={<FaCalendarAlt />}>
              <input 
                type="date" 
                className={`input ${err.startDate ? 'border-red-500' : 'border-gray-300'}`}
                value={form.startDate} 
                onChange={e => onChange("startDate", e.target.value)}
              />
            </Field>
            
            <Field label="Tugash sanasi" error={err.endDate} icon={<FaCalendarAlt />}>
              <input 
                type="date" 
                className={`input ${err.endDate ? 'border-red-500' : 'border-gray-300'}`}
                value={form.endDate} 
                onChange={e => onChange("endDate", e.target.value)}
                min={form.startDate}
              />
            </Field>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ijara muddati (kun)" icon={<FaCalculator />}>
                <div className="flex items-center">
                  <input 
                    className="input bg-gray-50 font-medium" 
                    value={form.totalDays} 
                    readOnly 
                  />
                  <span className="ml-2 text-gray-500">kun</span>
                </div>
              </Field>
              
              <Field label="Umumiy narx (so'm)" icon={<FaMoneyBillWave />}>
                <div className="flex items-center">
                  <input 
                    className="input bg-gray-50 font-bold text-emerald-700" 
                    value={form.totalPrice.toLocaleString()} 
                    readOnly 
                  />
                  <span className="ml-2 text-gray-500">so'm</span>
                </div>
              </Field>
            </div>
          </Section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              onClick={() => nav(-1)} 
              className="btn-secondary flex items-center"
            >
              <FaTimes className="mr-2" />
              Bekor qilish
            </button>
            <button 
              onClick={submit} 
              className="btn-primary flex items-center"
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

// Enhanced Field Component
function Field({ label, error, children, icon }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 flex items-center">
        {icon && <span className="mr-2 text-emerald-600">{icon}</span>}
        {label}
        {error && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Enhanced Section Component
function Section({ title, children, icon }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center border-b border-gray-200 pb-2">
        {icon && <span className="mr-2">{icon}</span>}
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}