import React from 'react';
import Header from '../../components/Header';
import HeroBanner from '../../components/HeroBanner';
import CategorySection from '../../components/CategorySection';
import FeaturedToys from '../../components/FeaturedToys';
import PopularToys from '../../components/PopularToys';
import Footer from '../../components/Footer';

export default function HomePage() {
  return (
    <div className="homepage-wrapper">
      <Header />
      <HeroBanner />
      <CategorySection />
      <FeaturedToys />
      <PopularToys />
      <Footer />
    </div>
  );
}
