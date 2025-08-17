import { useState } from "react";
import { useNavigate } from "react-router";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { 
  FaUser, FaPhone, FaIdCard, FaMapMarkerAlt, 
  FaBox, FaTags, FaRuler, FaCalculator, 
  FaCalendarAlt, FaMoneyBillWave, FaSave, FaTimes 
} from "react-icons/fa";

export default function AddClient() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    fullName: "", phone: "", passportId: "", address: "",
    productName: "", productType: "", productSize: "",
    quantity: "", dailyPrice: "", startDate: "", actualDays: "", totalPrice: 0
  });
  
  const [err, setErr] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateWarning, setDateWarning] = useState("");

  const onChange = (k, v) => {
    setForm(prev => {
      let updated = { ...prev, [k]: v };

      // Calculate total price when relevant fields change
      if (updated.quantity && updated.dailyPrice && updated.actualDays) {
        updated.totalPrice = Number(updated.quantity) * Number(updated.dailyPrice) * Number(updated.actualDays);
      }

      // Calculate suggested days if start date is provided
      if (k === "startDate" && v) {
        const today = new Date().toISOString().slice(0, 10);
        if (v > today) {
          setDateWarning("Boshlanish sanasi bugundan keyin bo'lishi mumkin emas");
        } else {
          setDateWarning("");
        }
      }

      return updated;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Majburiy maydon";
    if (!form.phone.trim()) e.phone = "Majburiy maydon";
    if (!form.address.trim()) e.address = "Majburiy maydon";
    if (!form.productName.trim()) e.productName = "Majburiy maydon";
    if (!form.productType.trim()) e.productType = "Majburiy maydon";
    if (!form.productSize.trim()) e.productSize = "Majburiy maydon";
    if (!form.quantity) e.quantity = "Majburiy maydon";
    if (!form.dailyPrice) e.dailyPrice = "Majburiy maydon";
    if (!form.startDate) e.startDate = "Majburiy maydon";
    if (!form.actualDays || form.actualDays <= 0) e.actualDays = "Iltimos, to'g'ri kun kiriting";
    
    setErr(e); 
    return Object.keys(e).length === 0;
  };
  
  const submit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    
    try {
      // Add client data
      const clientData = {
        fullName: form.fullName,
        phone: form.phone,
        passportId: form.passportId,
        address: form.address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const clientRef = await addDoc(collection(db, "clients"), clientData);

      // Calculate end date based on start date and actual days
      const startDate = new Date(form.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Number(form.actualDays));

      // Add rental data
      const rentalData = {
        clientId: clientRef.id,
        clientName: form.fullName,
        productName: form.productName,
        productType: form.productType,
        productSize: form.productSize,
        quantity: Number(form.quantity),
        dailyPrice: Number(form.dailyPrice),
        totalDays: Number(form.actualDays),
        totalPrice: Number(form.totalPrice),
        startDate: form.startDate,
        endDate: endDate.toISOString().slice(0, 10),
        actualDaysUsed: Number(form.actualDays),
        paymentDueDate: endDate.toISOString().slice(0, 10),
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "rentals"), rentalData);
      
      nav("/", { state: { success: true } });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Xatolik yuz berdi. Iltimos, qaytadan urunib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
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
                max={new Date().toISOString().slice(0, 10)}
              />
              {dateWarning && (
                <p className="mt-1 text-sm text-yellow-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {dateWarning}
                </p>
              )}
            </Field>
            
            <Field label="Ijara kuni (necha kun)" error={err.actualDays} icon={<FaCalendarAlt />}>
              <input 
                type="number" 
                className={`input ${err.actualDays ? 'border-red-500' : 'border-gray-300'}`}
                value={form.actualDays} 
                onChange={e => onChange("actualDays", e.target.value)}
                min="1"
                placeholder="Ishlatilgan kunlar soni"
              />
            </Field>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tugash sanasi" icon={<FaCalendarAlt />}>
              <div className="flex items-center">
  <input 
    className="input bg-gray-50 font-medium" 
    value={
      form.startDate && form.actualDays 
        ? new Date(
            new Date(form.startDate).getTime() + 
            (Number(form.actualDays) * 24 * 60 * 60 * 1000)
          ).toISOString().slice(0, 10)
        : ""
    } 
    readOnly 
  />
</div>              </Field>
              
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
              disabled={isSubmitting}
            >
              <FaTimes className="mr-2" />
              Bekor qilish
            </button>
            <button 
              onClick={submit} 
              className="btn-primary flex items-center"
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
      </div>
    </div>
  );
}

// Field Component
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

// Section Component
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