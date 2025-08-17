import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { db } from "../../config/firebase";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBox,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";

export default function ClientDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [client, setClient] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);

  // ===== Helpers =====
  const formatUZS = (n) => (Number(n) || 0).toLocaleString("uz-UZ");
  const todayISO = () => new Date().toISOString().split("T")[0];

  const toDate = (v) => {
    // startDate/returnDate kutilgan format: 'YYYY-MM-DD'
    // Notog'ri qiymatlarga bardoshlilik
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  const calculateDays = (startDate, returnDate) => {
    const start = toDate(startDate);
    const end = toDate(returnDate) || new Date();
    if (!start) return 0;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    // UTC kechishlardan ta'sirni kamaytirish uchun vaqtlarni 00:00ga normalize qilamiz
    const s = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
    const e = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
    const diff = Math.ceil((e - s) / MS_PER_DAY);
    return diff > 0 ? diff : 1; // kamida 1 kun
  };

  const calculateTotalPrice = (dailyPrice, days) =>
    (Number(dailyPrice) || 0) * (days || 1);

  // ===== Real-time client =====
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "clients", id),
      (snap) => {
        setClient(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (err) => {
        console.error("Client snapshot error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  // ===== Real-time rentals for this client =====
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const q = query(
      collection(db, "rentals"),
      where("clientId", "==", id),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data();

          const days = calculateDays(data.startDate, data.returnDate);
          const dynTotal = calculateTotalPrice(data.dailyPrice, days);

          // Agar hujjatda allaqachon yakuniy totalPrice saqlangan bo'lsa va returnDate mavjud bo'lsa — uni ishlatamiz.
          // Aks holda dinamik hisob-kitob.
          const finalShownTotal =
            data.returnDate && typeof data.totalPrice === "number"
              ? data.totalPrice
              : dynTotal;

          return {
            id: d.id,
            ...data,
            // UI uchun derivativlar:
            totalDays: days,
            totalPrice: finalShownTotal,
            dailyPrice: Number(data.dailyPrice) || 0,
          };
        });
        setRentals(list);
        setLoading(false);
      },
      (err) => {
        console.error("Rentals snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [id]);

  const activeRentals = useMemo(
    () =>
      rentals.filter(
        (r) => !(r.returnDate || r.status === "returned" || r.returned === true)
      ),
    [rentals]
  );

  const returnedRentals = useMemo(
    () =>
      rentals.filter(
        (r) => r.returnDate || r.status === "returned" || r.returned === true
      ),
    [rentals]
  );

  const totals = useMemo(() => {
    // Aktivlar — bugungi kunga qadar dinamik hisoblanadi
    const activeSum = activeRentals.reduce((s, r) => {
      const daysNow = calculateDays(r.startDate, null);
      return s + calculateTotalPrice(r.dailyPrice, daysNow);
    }, 0);

    // Qaytarilganlar — qaytarilgan sana uchun yakuniy (doc.totalPrice bo'lsa shuni, bo'lmasa hisob)
    const returnedSum = returnedRentals.reduce((s, r) => {
      if (typeof r.totalPrice === "number") return s + r.totalPrice;
      const days = calculateDays(r.startDate, r.returnDate);
      return s + calculateTotalPrice(r.dailyPrice, days);
    }, 0);

    return {
      activeCount: activeRentals.length,
      returnedCount: returnedRentals.length,
      activeSum,
      returnedSum,
      allSum: activeSum + returnedSum,
    };
  }, [activeRentals, returnedRentals]);

  // ===== Return product (update rental) =====
  const handleReturnProduct = async () => {
    if (!selectedRental || !returnDate) {
      alert("Iltimos, mahsulot va qaytarish sanasini tanlang!");
      return;
    }
    if (!window.confirm("Mahsulotni qaytarishni tasdiqlaysizmi?")) return;

    try {
      const days = calculateDays(selectedRental.startDate, returnDate);
      const finalTotal = calculateTotalPrice(selectedRental.dailyPrice, days);

      const rentalRef = doc(db, "rentals", selectedRental.id);
      await updateDoc(rentalRef, {
        returnDate,                 // tanlangan sana
        totalDays: days,            // yakuniy kunlar
        totalPrice: finalTotal,     // YAKUNIY summa (saqlaymiz!)
        status: "returned",
        returned: true,
        updatedAt: serverTimestamp(),
      });

      setSelectedRental(null);
      alert("Mahsulot muvaffaqiyatli qaytarildi!");
      // Realtime onSnapshot avtomatik yangilaydi
    } catch (error) {
      console.error("Error returning product:", error);
      alert("Xatolik yuz berdi. Iltimos, qaytadan urunib ko'ring.");
    }
  };

  // ===== UI =====
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="mb-4">Mijoz topilmadi</p>
        <button onClick={() => nav("/")} className="btn-primary">
          <FaArrowLeft className="mr-2" />
          Orqaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-700">
                <FaUser size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {client.fullName}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      totals.activeCount > 0
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {totals.activeCount} ta faol ijara
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Jami mahsulot: {rentals.length} ta
                  </span>
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
            </div>
          </div>

          <button onClick={() => nav(-1)} className="btn-secondary self-start sm:self-center">
            <FaArrowLeft className="mr-2" />
            Orqaga qaytish
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <FaMoneyBillWave />
              Faol ijaralar summasi (bugungi kungacha)
            </div>
            <div className="text-xl font-bold">{formatUZS(totals.activeSum)} so'm</div>
          </div>
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <FaMoneyBillWave />
              Qaytarilganlar summasi (yakuniy)
            </div>
            <div className="text-xl font-bold">{formatUZS(totals.returnedSum)} so'm</div>
          </div>
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <FaMoneyBillWave />
              Jami summa
            </div>
            <div className="text-xl font-bold">{formatUZS(totals.allSum)} so'm</div>
          </div>
        </div>
      </div>

      {/* Return modal */}
      {selectedRental && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Mahsulotni qaytarish</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mahsulot nomi
                </label>
                <div className="p-2 border border-gray-300 rounded bg-gray-50">
                  {selectedRental.productName} ({selectedRental.productType})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Olingan sana
                  </label>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    {selectedRental.startDate}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qaytarish sanasi
                  </label>
                  <input
                    type="date"
                    className="input border-gray-300 w-full"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    max={todayISO()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kunlik narx
                  </label>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    {formatUZS(selectedRental.dailyPrice)} so'm
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jami to'lov
                  </label>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50 font-bold">
                    {formatUZS(
                      calculateTotalPrice(
                        selectedRental.dailyPrice,
                        calculateDays(selectedRental.startDate, returnDate)
                      )
                    )}{" "}
                    so'm
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setSelectedRental(null)} className="btn-secondary">
                  Bekor qilish
                </button>
                <button onClick={handleReturnProduct} className="btn-primary flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Qaytarish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rentals table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FaBox className="text-emerald-600" />
            Ijara tarixi ({rentals.length} ta)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahsulot
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sana
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kunlar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Narx
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harakatlar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentals.length > 0 ? (
                rentals.map((r) => {
                  // Aktiv bo'lsa bugungi kungacha dinamik, qaytarilgan bo'lsa hujjatdagi yakuniy yoki hisoblangan
                  const isReturned = !!(r.returnDate || r.status === "returned" || r.returned === true);
                  const daysToShow = isReturned ? calculateDays(r.startDate, r.returnDate) : calculateDays(r.startDate, null);
                  const totalToShow = isReturned
                    ? (typeof r.totalPrice === "number" ? r.totalPrice : calculateTotalPrice(r.dailyPrice, daysToShow))
                    : calculateTotalPrice(r.dailyPrice, daysToShow);

                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">
                          {r.productName} ({r.productType})
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <div>
                          <FaCalendarAlt className="inline mr-1 text-emerald-600" /> {r.startDate}
                        </div>
                        {r.returnDate && (
                          <div className="text-xs text-gray-500">Qaytarildi: {r.returnDate}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{daysToShow} kun</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <div>{formatUZS(r.dailyPrice)} so'm/kun</div>
                        <div className="font-bold">{formatUZS(totalToShow)} so'm</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isReturned ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isReturned ? "Qaytarilgan" : "Faol"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {!isReturned && (
                          <button
                            onClick={() => {
                              setSelectedRental(r);
                              setReturnDate(todayISO());
                            }}
                            className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded hover:bg-emerald-200 flex items-center gap-1"
                          >
                            <FaCheckCircle size={12} />
                            Qaytarish
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">
                    Ijara tarixi mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
