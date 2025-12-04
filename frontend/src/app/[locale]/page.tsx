"use client";

import { Link } from "@/navigation";
import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface MultilingualText {
  en: string;
  th: string;
}

interface Series {
  id: string;
  title: MultilingualText;
  cover_image_url: string;
  description: MultilingualText;
}

export default function Home() {
  const [featuredSeries, setFeaturedSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const t = useTranslations('Navbar'); // Using Navbar translations for now or add Home translations

  const getLocalizedText = (text: MultilingualText | string) => {
    if (typeof text === 'string') return text;
    return text[locale as keyof MultilingualText] || text.en;
  };

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/series");
        if (response.ok) {
          const data = await response.json();
          setFeaturedSeries(data);
        } else {
          console.error("Failed to fetch series");
        }
      } catch (error) {
        console.error("Error fetching series:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      {/* <header className="bg-[#2596be] text-white py-10 text-center">
        <h2 className="text-4xl font-bold">Discover Your Next Favorite Story</h2>
        <p className="text-xl">Read thousands of comics, manga, and webtoons for free.</p>
      </header> */}

      {/* Featured Section */}
      <main className="mx-auto px-16 py-12">
        <h3 className="text-2xl font-medium mb-2">Featured Series</h3>
          <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
            {featuredSeries.map((series) => (
              <Link
                key={series.id}
                href={`/series/${series.id}`}
                className="group block w-48 flex-shrink-0 snap-start">
                <div className="relative overflow-hidden rounded-[6px]">
                  <img
                    src={series.cover_image_url}
                    alt={getLocalizedText(series.title)}
                    className="aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <p className="text-white text-sm line-clamp-12 text-left">
                      {getLocalizedText(series.description)}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="pt-2 text-base line-clamp-2 group-hover:text-indigo-600 transition-colors">{getLocalizedText(series.title)}</h4>
                </div>
              </Link>
            ))}
          </div>
      </main>


    </div>
  );
}
