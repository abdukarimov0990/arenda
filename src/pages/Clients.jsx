import { Link, useNavigate } from "react-router";
import { useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { 
  FaSearch, FaUserPlus, FaEye, 
  FaMoneyBillWave, FaTrash, FaUser 
} from "react-icons/fa";

export default function Clients() {
  const { clients, clientStats, deleteClient } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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

  const handleDelete = (clientId) => {
    if (window.confirm("Mijozni o'chirishni tasdiqlaysizmi?")) {
      deleteClient(clientId);
    }
  };

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