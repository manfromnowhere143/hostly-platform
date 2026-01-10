export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          {/* Logo */}
          <h1 className="text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Hostly
            </span>
          </h1>

          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            The all-in-one platform for vacation rentals. Build stunning websites,
            manage bookings, and grow your business.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <a
              href="/login"
              className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="px-8 py-3 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition"
            >
              Get Started
            </a>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Beautiful Websites</h3>
              <p className="text-zinc-400">
                Launch a stunning, mobile-first website in minutes. No coding required.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Booking Engine</h3>
              <p className="text-zinc-400">
                Accept direct bookings with real-time availability and instant confirmations.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Channel Manager</h3>
              <p className="text-zinc-400">
                Sync with Airbnb, Booking.com, VRBO and 40+ channels automatically.
              </p>
            </div>
          </div>

          {/* First Customer */}
          <div className="mt-20 pt-10 border-t border-zinc-800">
            <p className="text-zinc-500 text-sm mb-4">POWERING</p>
            <a
              href="https://rently-luxury.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-semibold text-zinc-300 hover:text-white transition"
            >
              Rently Luxury
            </a>
            <p className="text-zinc-500 mt-2">Eilat&apos;s Premier Vacation Rentals</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          <p>&copy; 2025 Hostly. Built with excellence.</p>
        </div>
      </footer>
    </main>
  )
}
