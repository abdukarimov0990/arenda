import React, { createContext, useContext, useEffect, useState , useMemo} from "react";
import { 
  collection, doc, setDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp 
} from "firebase/firestore";
import { db } from ".././config/firebase";

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const unsubscribeClients = onSnapshot(
      query(collection(db, "clients"), orderBy("fullName")),
      (snapshot) => {
        const clientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsData);
      }
    );

    const unsubscribeRentals = onSnapshot(
      collection(db, "rentals"),
      (snapshot) => {
        const rentalsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRentals(rentalsData);
      }
    );

    const unsubscribePayments = onSnapshot(
      query(collection(db, "payments"), orderBy("date", "desc")),
      (snapshot) => {
        const paymentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPayments(paymentsData);
      }
    );

    setLoading(false);

    return () => {
      unsubscribeClients();
      unsubscribeRentals();
      unsubscribePayments();
    };
  }, []);

  // Calculate client stats
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

  // CRUD operations
  const addClient = async (data) => {
    try {
      const newClientRef = doc(collection(db, "clients"));
      await setDoc(newClientRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding client:", error);
      throw error;
    }
  };

  const deleteClient = async (id) => {
    try {
      // Delete client
      await deleteDoc(doc(db, "clients", id));
      
      // Optionally delete related rentals and payments
      // This would require additional queries to find all related documents
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  };

  const addPayment = async ({ clientId, amount, date }) => {
    try {
      const newPaymentRef = doc(collection(db, "payments"));
      await setDoc(newPaymentRef, {
        clientId,
        amount: Number(amount),
        date,
        createdAt: serverTimestamp()
      });

      // Update rental status if fully paid
      const stats = clientStats.find(s => s.clientId === clientId);
      const newPaid = (stats?.paid || 0) + Number(amount);
      const total = stats?.total || 0;
      
      if (newPaid >= total && total > 0) {
        // Find and update all rentals for this client
        const rentalsQuery = query(
          collection(db, "rentals"),
          where("clientId", "==", clientId)
        );
        const querySnapshot = await getDocs(rentalsQuery);
        
        const updates = querySnapshot.docs.map(doc => 
          updateDoc(doc.ref, { status: "paid" })
        );
        
        await Promise.all(updates);
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  const value = {
    clients,
    rentals,
    payments,
    clientStats,
    addClient,
    deleteClient,
    addPayment,
    loading
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}