import React, { useState } from "react";
import { Link } from "react-router-dom";

const SuperAdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (username === "shubham" && password === "shubham1234") {
      // Login successful, redirect to /super-admin
      window.location.href = "/super-admin";
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className={`h-screen flex justify-center items-center bg-cyan-100/70`}>
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Super Admin Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <button
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
