import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Faqat bitta maxsus foydalanuvchi (admin)
    const validUser = "admin";
    const validPass = "1234";

    if (username === validUser && password === validPass) {
      localStorage.setItem("authUser", JSON.stringify({ username }));
      onLogin();
    } else {
      setError("Login yoki parol noto‘g‘ri!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Kirish</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <input
          type="text"
          placeholder="Username"
          className="w-full border rounded-md px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-md px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
