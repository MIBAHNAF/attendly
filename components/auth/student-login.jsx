"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { signInWithEmail, signInWithGoogle, registerWithEmail, resendEmailVerification, signOutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Chrome, GraduationCap } from "lucide-react";

export default function StudentLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate password confirmation for registration
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      let result;
      
      if (isLogin) {
        result = await signInWithEmail(formData.email, formData.password);
      } else {
        result = await registerWithEmail(formData.email, formData.password, {
          name: formData.name,
          role: "student"
        });
      }

      if (result.success) {
        if (isLogin) {
          // Check if email is verified for login
          const user = result.user;
          if (user && !user.emailVerified) {
            setError("Please verify your email before signing in. Check your inbox for the verification link.");
            await signOutUser(); // Sign out unverified user
            return;
          }
          router.push("/student/dashboard");
        } else {
          setSuccess(result.message || "Account created successfully! Please check your email for verification.");
          setFormData({ email: "", password: "", confirmPassword: "", name: "" });
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    const result = await resendEmailVerification();
    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        router.push("/student/dashboard");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-blue-400" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Welcome Back" : "Join as Student"}
          </h1>
          <p className="text-gray-400">
            {isLogin ? "Sign in to your student account" : "Create your student account"}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-6"
          >
            <p className="text-green-400 text-sm">{success}</p>
            {success.includes("verification") && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="text-green-300 underline text-xs mt-1 hover:text-green-200 transition-colors"
              >
                Resend verification email
              </button>
            )}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field (Register Only) */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Confirm Password Field (Register Only) */}
          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
                minLength={6}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-4 text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        {/* Google Sign In */}
        <motion.button
          onClick={handleGoogleSignIn}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Chrome className="w-5 h-5" />
          <span>Continue with Google</span>
        </motion.button>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
              setFormData({ email: "", password: "", confirmPassword: "", name: "" });
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
