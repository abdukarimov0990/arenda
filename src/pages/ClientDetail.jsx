import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useStore } from "../store.jsx";
import { 
  FaUser, FaPhone, FaIdCard, FaMapMarkerAlt, 
  FaBox, FaRuler, FaCalculator, FaMoneyBillWave, 
  FaCalendarAlt, FaArrowLeft, FaPlusCircle 
} from "react-icons/fa";

export default function ClientDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { clients, rentals, payments, clientStats } = useStore();

  const client = clients.find(c => c.id === id);
  const stats = clientStats.find(s => s.clientId === id) || { total:0, paid:0, debt:0 };
  const myRentals = rentals.filter(r => r.clientId === id);
  const myPayments = payments.filter(p => p.clientId === id);
  const lastRental = myRentals[myRentals.length - 1];

  const statusLabel = useMemo(() => {
    if (stats.debt <= 0 && stats.total > 0) return (
      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
        To'langan
      </span>
    );
    if (stats.debt > 0) return (
      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
        Qarzdor: {stats.debt.toLocaleString()} so'm
      </span>
    );
    return (
      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
        Faol
      </span>
    );
  }, [stats]);

  if (!client) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="mb-4">Mijoz topilmadi</p>
        <button 
          onClick={() => nav("/")} 
          className="btn-primary"
        >
          <FaArrowLeft className="mr-2" />
          Orqaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-700">
                <FaUser size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{client.fullName}</h2>
                <div className="flex items-center gap-3 mt-1">
                  {statusLabel}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaPhone className="text-emerald-600" />
                {client.phone}
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-emerald-600" />
                {client.address}
              </div>
              <div className="flex items-center gap-2">
                <FaIdCard className="text-emerald-600" />
                Passport/ID: {client.passportId}
              </div>
            </div>
          </div>

          <Link 
            to={`/payments/new?clientId=${client.id}`} 
            className="btn-primary self-start sm:self-center"
          >
            <FaPlusCircle className="mr-2" />
            To'lov qo'shish
          </Link>
        </div>

        {/* Last Rental Info */}
        {lastRental && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <FaBox className="text-emerald-600" />
              Oxirgi ijara ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <InfoItem label="Mahsulot" icon={<FaBox />}>
                {lastRental.productName} ({lastRental.productType})
              </InfoItem>
              <InfoItem label="Razmer" icon={<FaRuler />}>
                {lastRental.productSize}
              </InfoItem>
              <InfoItem label="Soni" icon={<FaCalculator />}>
                {lastRental.quantity}
              </InfoItem>
              <InfoItem label="Kunlik narx" icon={<FaMoneyBillWave />}>
                {lastRental.dailyPrice.toLocaleString()} so'm
              </InfoItem>
              <InfoItem label="Ijara muddati" icon={<FaCalendarAlt />}>
                {lastRental.startDate} → {lastRental.paymentDueDate}
              </InfoItem>
              <InfoItem label="Umumiy narx" icon={<FaMoneyBillWave />}>
                <span className="font-semibold">
                  {lastRental.totalPrice.toLocaleString()} so'm
                </span>
              </InfoItem>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          label="Umumiy summa" 
          value={stats.total.toLocaleString() + " so'm"} 
          icon={<FaMoneyBillWave />}
          color="emerald"
        />
        <StatCard 
          label="To'langan" 
          value={stats.paid.toLocaleString() + " so'm"} 
          icon={<FaMoneyBillWave />}
          color="blue"
        />
        <StatCard 
          label="Qolgan qarz" 
          value={stats.debt.toLocaleString() + " so'm"} 
          icon={<FaMoneyBillWave />}
          color={stats.debt > 0 ? "red" : "gray"}
        />
      </div>

      {/* Rentals and Payments Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rentals Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Ijaralar tarixi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mahsulot
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soni
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kun
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jami
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myRentals.length > 0 ? (
                  myRentals.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {r.productName} <span className="text-gray-500">({r.productSize})</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {r.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {r.totalDays}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                        {r.totalPrice.toLocaleString()} so'm
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === "paid" ? "bg-green-100 text-green-800" :
                          r.status === "debt" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {r.status === "paid" ? "To'langan" : 
                           r.status === "debt" ? "Qarzdor" : "Faol"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                      Ijara tarixi mavjud emas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">To'lovlar tarixi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sana
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summa
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myPayments.length > 0 ? (
                  myPayments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {p.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-emerald-700">
                        +{p.amount.toLocaleString()} so'm
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-sm text-gray-500">
                      To'lovlar tarixi mavjud emas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button 
        onClick={() => nav(-1)} 
        className="btn-secondary"
      >
        <FaArrowLeft className="mr-2" />
        Orqaga qaytish
      </button>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color = "emerald" }) {
  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({ label, children, icon }) {
  return (
    <div>
      <p className="text-xs text-gray-500 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium mt-1">{children}</p>
    </div>
  );
}