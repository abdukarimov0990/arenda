import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../config/firebase";
import { 
  collection, getDocs, query, where, 
  doc, deleteDoc, orderBy 
} from "firebase/firestore";
import { 
  FaSearch, FaUserPlus, FaEye, 
  FaMoneyBillWave, FaTrash, FaUser 
} from "react-icons/fa";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch clients and calculate stats
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch clients
        const clientsQuery = query(
          collection(db, "clients"),
          orderBy("fullName", "asc")
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsData = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsData);

        // Calculate stats for each client
        const statsPromises = clientsData.map(async client => {
          // Get rentals for client
          const rentalsQuery = query(
            collection(db, "rentals"),
            where("clientId", "==", client.id)
          );
          const rentalsSnapshot = await getDocs(rentalsQuery);
          const total = rentalsSnapshot.docs.reduce((sum, doc) => sum + doc.data().totalPrice, 0);

          // Get payments for client
          const paymentsQuery = query(
            collection(db, "payments"),
            where("clientId", "==", client.id)
          );
          const paymentsSnapshot = await getDocs(paymentsQuery);
          const paid = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

          return {
            clientId: client.id,
            total,
            paid,
            debt: total - paid
          };
        });

        const stats = await Promise.all(statsPromises);
        setClientStats(stats);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const clientRows = useMemo(() => {
    const statsById = {};
    clientStats.forEach(s => { statsById[s.clientId] = s; });
    
    return clients
      .filter(client =>
        [client.fullName, client.phone, client.address, client.passportId]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .map(client => {
        const stats = statsById[client.id] || { total: 0, paid: 0, debt: 0 };
        return { ...client, ...stats };
      });
  }, [clients, clientStats, searchQuery]);

  const handleDelete = async (clientId) => {
    if (window.confirm("Mijozni o'chirishni tasdiqlaysizmi? Bundan keyin uni tiklab bo'lmaydi.")) {
      try {
        // Delete client
        await deleteDoc(doc(db, "clients", clientId));
        
        // Delete related rentals (optional)
        const rentalsQuery = query(
          collection(db, "rentals"),
          where("clientId", "==", clientId)
        );
        const rentalsSnapshot = await getDocs(rentalsQuery);
        const deleteRentals = rentalsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deleteRentals);
        
        // Delete related payments (optional)
        const paymentsQuery = query(
          collection(db, "payments"),
          where("clientId", "==", clientId)
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const deletePayments = paymentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePayments);

        // Update local state
        setClients(clients.filter(c => c.id !== clientId));
        setClientStats(clientStats.filter(s => s.clientId !== clientId));

      } catch (error) {
        console.error("Error deleting client:", error);
        alert("Mijozni o'chirishda xatolik yuz berdi. Iltimos, qaytadan urunib ko'ring.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Mijozlarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Link 
          to="/clients/new" 
          className="btn-primary flex items-center w-full sm:w-auto"
        >
          <FaUserPlus className="mr-2" />
          Yangi mijoz qo'shish
        </Link>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mijoz
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aloqa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Umumiy
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To'langan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qarz
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientRows.length > 0 ? (
                clientRows.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <FaUser />
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
                          >
                            {client.fullName}
                          </button>
                          <div className="text-sm text-gray-500">{client.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {client.total.toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {client.paid.toLocaleString()} so'm
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      client.debt > 0 ? "text-red-600" : "text-gray-600"
                    }`}>
                      {client.debt.toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="btn-icon"
                          title="Ko'rish"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => navigate(`/payments/new?clientId=${client.id}`)}
                          className="btn-icon text-blue-600 hover:bg-blue-50"
                          title="To'lov qo'shish"
                        >
                          <FaMoneyBillWave />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="btn-icon text-red-600 hover:bg-red-50"
                          title="O'chirish"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FaSearch className="h-8 w-8 mb-2" />
                      <p>Hech qanday mijoz topilmadi</p>
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")} 
                          className="mt-2 text-sm text-emerald-600 hover:underline"
                        >
                          Qidiruvni tozalash
                        </button>
                      )}
                    </div>
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