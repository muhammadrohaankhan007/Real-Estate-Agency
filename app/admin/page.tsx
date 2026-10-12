"use client";

import { useState } from "react";

export default function AdminDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("Listing published successfully to Supabase!");
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to publish listing: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting listing");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-serif font-light tracking-wide text-white">Prime Time <span className="text-amber-500">Command</span></h1>
          <p className="text-white/50 mt-2 text-sm">Secure Property Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/[0.02] border border-white/10 p-8 rounded-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/60">Property Title</label>
              <input name="title" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="e.g. Ultra-Luxury Bungalow" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/60">Demand (PKR)</label>
              <input name="demand" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="e.g. 450,000,000" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/60">Location</label>
              <input name="location" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="e.g. DHA Phase 8, Karachi" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/60">Size</label>
              <input name="size" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="e.g. 1000 Sq. Yds" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/60">Bedrooms</label>
              <input type="number" name="bedrooms" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="e.g. 6" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/60">Bathrooms</label>
              <input type="number" name="bathrooms" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="e.g. 7" />
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <label className="text-xs uppercase tracking-widest text-white/60">Description</label>
            <textarea name="description" rows={4} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="Luxury specifications and details..." />
          </div>

          <div className="space-y-2 mt-6">
            <label className="text-xs uppercase tracking-widest text-white/60">High-Res Property Image</label>
            <input type="file" name="image" accept="image/*" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer transition-colors" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full mt-8 bg-white text-black font-medium tracking-wide py-4 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50">
            {isSubmitting ? "ENCRYPTING & PUBLISHING..." : "PUBLISH TO PORTFOLIO"}
          </button>
        </form>
      </div>
    </div>
  );
}
