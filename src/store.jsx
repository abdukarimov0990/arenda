import React, { createContext, useContext, useMemo, useState } from "react";
import { nanoid } from "nanoid";

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }) {
  // Demo ma'lumotlar
  const [clients, setClients] = useState([
    { id: "c1", fullName: "Jahongir Karimov", phone: "998901112233", passportId: "AB1234567", address: "Toshkent" },
    { id: "c2", fullName: "Gulbahor Ismoilova", phone: "998909998877", passportId: "AA7654321", address: "Samarqand" },
  ]);

  // Ijaralar (umumiy narx shu yerda saqlanadi)
  const [rentals, setRentals] = useState([
    { id: "r1", clientId: "c1", productName: "Lesa", productType: "Lesa", productSize: "6m", quantity: 10, dailyPrice: 30000, totalDays: 5, totalPrice: 1500000, paymentDueDate: "2025-08-20", status: "debt" },
    { id: "r2", clientId: "c2", productName: "Stoyka", productType: "Stoyka", productSize: "3m", quantity: 20, dailyPrice: 15000, totalDays: 3, totalPrice: 900000, paymentDueDate: "2025-08-18", status: "active" },
  ]);

  // To'lovlar alohida (clientId bo‘yicha bog‘lanadi)
  const [payments, setPayments] = useState([
    { id: "p1", clientId: "c1", amount: 500000, date: "2025-08-10" },
  ]);

  // Hisob-kitoblar
  const clientStats = useMemo(() => {
    const totalByClient = {};
    const paidByClient = {};

    rentals.forEach(r => {
      totalByClient[r.clientId] = (totalByClient[r.clientId] || 0) + (r.totalPrice || 0);
    });
    payments.forEach(p => {
      paidByClient[p.clientId] = (paidByClient[p.clientId] || 0) + (p.amount || 0);
    });

    return clients.map(c => {
      const total = totalByClient[c.id] || 0;
      const paid = paidByClient[c.id] || 0;
      const debt = Math.max(0, total - paid);
      return { clientId: c.id, total, paid, debt };
    });
  }, [clients, rentals, payments]);

  // CRUD helpers
  const addClient = (data) => {
    setClients(prev => [...prev, { id: nanoid(), ...data }]);
  };
  const deleteClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setRentals(prev => prev.filter(r => r.clientId !== id));
    setPayments(prev => prev.filter(p => p.clientId !== id));
  };

  const addPayment = ({ clientId, amount, date }) => {
    setPayments(prev => [...prev, { id: nanoid(), clientId, amount: Number(amount || 0), date }]);
    // Statusni yangilash (agar to'liq to‘langan bo‘lsa, “paid”ga o‘tkazish)
    const stats = clientStats.find(s => s.clientId === clientId);
    const newPaid = (stats?.paid || 0) + Number(amount || 0);
    const total = stats?.total || 0;
    if (newPaid >= total && total > 0) {
      setRentals(prev =>
        prev.map(r => r.clientId === clientId ? { ...r, status: "paid" } : r)
      );
    }
  };

  const value = {
    clients, setClients, addClient, deleteClient,
    rentals, setRentals,
    payments, setPayments, addPayment,
    clientStats
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
