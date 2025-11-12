"use client";

import { signIn } from "next-auth/react";
import "./login.css";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      {/* Floating gradient circles */}
      <div className="absolute w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl top-20 left-20 animate-float-slow" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl bottom-20 right-20 animate-float-slower" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white/20 w-[90%] sm:w-[400px] text-center z-10"
      >
        <h1 className="text-3xl font-bold mb-3 gradient-text">Welcome Back!</h1>
        <p className="text-white/70 mb-8 text-sm">
          Sign in to continue using <span className="font-semibold text-pink-400">Voice AI Agent</span>
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg w-full"
        >
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}
