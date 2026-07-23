"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from "lucide-react";
import { useWebSettings } from "@/hooks/useWebSettings"; // Ajusta la ruta a tu hook

export const HeroBanner = () => {
  const { config } = useWebSettings();
  const [currentSlide, setCurrentSlide] = useState(0);

  const envApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const apiBase = envApi.replace("/api/v1", "");

  const banners = config?.bannersUrls || [];

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-900 via-purple-900 to-slate-900 text-white shadow-xl min-h-80 sm:min-h-95 flex items-center justify-between px-6 sm:px-12">
        <div className="max-w-2xl space-y-4 z-10">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md uppercase tracking-wider text-amber-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ZARELY MODA & ACCESORIOS</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            ¡Bienvenidos a nuestra Tienda Virtual!
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Explora las mejores ofertas y realiza tu pedido para recojo en tienda de forma rápida y sencilla.
          </p>
          <div className="pt-2">
            <Link
              href="/catalogo"
              className="inline-flex items-center space-x-2 font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-lg active:scale-95 bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Catálogo Completo</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentImageUrl = banners[currentSlide].startsWith("http")
    ? banners[currentSlide]
    : `${apiBase}${banners[currentSlide]}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl min-h-80 sm:min-h-95 flex items-center transition-all duration-500">
      <img
        src={currentImageUrl}
        alt={`Banner ${currentSlide + 1}`}
        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-all duration-700"
      />

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};