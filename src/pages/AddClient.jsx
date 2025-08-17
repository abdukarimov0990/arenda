import { useState } from "react";
import { useNavigate } from "react-router";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { 
  FaUser, FaPhone, FaMapMarkerAlt, 
  FaBox, FaTags, FaMoneyBillWave, FaSave, FaTimes,
  FaPlus, FaTrash,
  FaCalendarAlt
} from "react-icons/fa";

export default function AddClient() {
  const nav = useNavigate();

  const [clientInfo, setClientInfo] = useState({
    fullName: "", 
    phone: "", 
    address: ""
  });

  const [products, setProducts] = useState([
    {
      productName: "", 
      productType: "", 
      startDate: "",
      dailyPrice: "",
      totalPrice: 0
    }
  ]);

  const [err, setErr] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClientChange = (key, value) => {
    setClientInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleProductChange = (index, key, value) => {
    setProducts(prev => {
      const updatedProducts = [...prev];
      const updatedProduct = { ...updatedProducts[index], [key]: value };

      // Calculate total price when daily price changes
      if (key === "dailyPrice") {
        updatedProduct.totalPrice = Number(updatedProduct.dailyPrice);
      }

      updatedProducts[index] = updatedProduct;
      return updatedProducts;
    });
  };

  const addProduct = () => {
    setProducts(prev => [
      ...prev,
      {
        productName: "", 
        productType: "", 
        startDate: "",
        dailyPrice: "",
        totalPrice: 0
      }
    ]);
  };

  const removeProduct = (index) => {
    if (products.length <= 1) return;
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};
    
    // Validate client info
    if (!clientInfo.fullName.trim()) errors.fullName = "Majburiy maydon";
    if (!clientInfo.phone.trim()) errors.phone = "Majburiy maydon";
    if (!clientInfo.address.trim()) errors.address = "Majburiy maydon";
    
    // Validate products
    products.forEach((product, index) => {
      if (!product.productName.trim()) errors[`productName_${index}`] = "Majburiy maydon";
      if (!product.productType.trim()) errors[`productType_${index}`] = "Majburiy maydon";
      if (!product.startDate) errors[`startDate_${index}`] = "Majburiy maydon";
      if (!product.dailyPrice || product.dailyPrice <= 0) errors[`dailyPrice_${index}`] = "Noto'g'ri narx";
    });
    
    setErr(errors);
    return Object.keys(errors).length === 0;
  };
  
  const submit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    
    try {
      // Add client data
      const clientData = {
        fullName: clientInfo.fullName,
        phone: clientInfo.phone,
        address: clientInfo.address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const clientRef = await addDoc(collection(db, "clients"), clientData);

      // Add rental data for each product
      for (const product of products) {
        const rentalData = {
          clientId: clientRef.id,
          clientName: clientInfo.fullName,
          productName: product.productName,
          productType: product.productType,
          dailyPrice: Number(product.dailyPrice),
          totalPrice: Number(product.totalPrice),
          startDate: product.startDate,
          status: "active",
          returned: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await addDoc(collection(db, "rentals"), rentalData);
      }
      
      nav("/", { state: { success: true } });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Xatolik yuz berdi. Iltimos, qaytadan urunib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalAmount = () => {
    return products.reduce((sum, product) => sum + product.totalPrice, 0);
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
                value={clientInfo.fullName} 
                onChange={e => handleClientChange("fullName", e.target.value)}
                placeholder="To'liq ism sharifi"
              />
            </Field>
            
            <Field label="Telefon raqami" error={err.phone} icon={<FaPhone />}>
              <input 
                className={`input ${err.phone ? 'border-red-500' : 'border-gray-300'}`}
                value={clientInfo.phone} 
                onChange={e => handleClientChange("phone", e.target.value)}
                placeholder="99890xxxxxxx"
              />
            </Field>
            
            <Field label="Manzil (ijara manzili)" error={err.address} icon={<FaMapMarkerAlt />}>
              <input 
                className={`input ${err.address ? 'border-red-500' : 'border-gray-300'}`}
                value={clientInfo.address} 
                onChange={e => handleClientChange("address", e.target.value)}
                placeholder="To'liq manzil"
              />
            </Field>
          </Section>

          {/* Products Section */}
          {products.map((product, index) => (
            <Section 
              key={index}
              title={`Mahsulot ${index + 1}`} 
              icon={<FaBox className="text-emerald-600" />}
              action={
                products.length > 1 && (
                  <button 
                    onClick={() => removeProduct(index)}
                    className="text-red-500 hover:text-red-700 flex items-center text-sm"
                  >
                    <FaTrash className="mr-1" /> O'chirish
                  </button>
                )
              }
            >
              <Field 
                label="Mahsulot nomi" 
                error={err[`productName_${index}`]} 
                icon={<FaBox />}
              >
                <input 
                  className={`input ${err[`productName_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                  value={product.productName} 
                  onChange={e => handleProductChange(index, "productName", e.target.value)}
                  placeholder="Mahsulot nomi"
                />
              </Field>
              
              <Field 
                label="Mahsulot turi" 
                error={err[`productType_${index}`]} 
                icon={<FaTags />}
              >
                <select
                  className={`input ${err[`productType_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                  value={product.productType}
                  onChange={e => handleProductChange(index, "productType", e.target.value)}
                >
                  <option value="">Tanlang</option>
                  <option value="Lesa">Lesa</option>
                  <option value="Stoyka">Stoyka</option>
                  <option value="Apilafka">Apilafka</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </Field>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field 
                  label="Boshlanish sanasi" 
                  error={err[`startDate_${index}`]} 
                  icon={<FaCalendarAlt />}
                >
                  <input 
                    type="date" 
                    className={`input ${err[`startDate_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                    value={product.startDate} 
                    onChange={e => handleProductChange(index, "startDate", e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </Field>
                
                <Field 
                  label="Kunlik ijara narxi (so'm)" 
                  error={err[`dailyPrice_${index}`]} 
                  icon={<FaMoneyBillWave />}
                >
                  <input 
                    type="number" 
                    className={`input ${err[`dailyPrice_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                    value={product.dailyPrice} 
                    onChange={e => handleProductChange(index, "dailyPrice", e.target.value)}
                    min="0"
                  />
                </Field>
              </div>
              
            </Section>
          ))}

          {/* Add Product Button */}
          <div className="flex justify-center">
            <button 
              onClick={addProduct}
              className="btn-secondary flex items-center"
            >
              <FaPlus className="mr-2" /> Yangi mahsulot qo'shish
            </button>
          </div>

          {/* Total Amount */}

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
function Section({ title, children, icon, action }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="grid grid-cols-1 gap-6">
        {children}
      </div>
    </div>
  );
}