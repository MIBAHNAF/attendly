import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              Attendly
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              NFC-Based Attendance Platform
            </p>
            <p className="text-lg text-gray-500">
              "Google Classroom + NFC-based Attendance" for the World
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2">NFC Attendance</h3>
              <p className="text-gray-600">Tap to mark attendance with NFC tags</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🧑‍🏫</div>
              <h3 className="text-lg font-semibold mb-2">Class Management</h3>
              <p className="text-gray-600">Create and manage classes easily</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">Comprehensive attendance reports</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register"
              className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Status */}
          <div className="mt-12 text-sm text-gray-500">
            🚧 Project in development - Ready for implementation phase
          </div>
        </div>
      </div>
    </div>
  );
}
