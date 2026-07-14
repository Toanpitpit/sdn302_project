import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import '../styles/components/HeroBanner.css';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1600&h=800&fit=crop',
    tag: 'NEW ARRIVALS',
    title: 'Discover the Joy of',
    highlight: 'Creative Learning',
    subtitle: 'Rent the latest educational and STEM toys for your children. Spark curiosity without the clutter.',
    cta: 'Explore Collection',
    link: '/toys'
  },
  {
    image: 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=1600&h=800&fit=crop',
    tag: 'BEST SELLERS',
    title: 'Top Rated Fun with',
    highlight: 'Premium LEGO Sets',
    subtitle: 'From Star Wars to Technic, rent massive LEGO builds for hours of constructive entertainment.',
    cta: 'Rent LEGO Now',
    link: '/toys?category=LEGO'
  },
  {
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=1600&h=800&fit=crop',
    tag: 'SMART PLAYING',
    title: 'Save Space & Money',
    highlight: 'Sustainable Playtimes',
    subtitle: 'Easy delivery, clean toys, flexible rental periods. Make playtime more eco-friendly and affordable.',
    cta: 'How It Works',
    link: '/toys'
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <div className="hb-section">
      {/* Background Slides */}
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`hb-bg-slide ${idx === currentSlide ? 'hb-active' : 'hb-hidden'}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}

      {/* Dark Overlay for contrast */}
      <div 
        className="hb-overlay" 
        style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)' }} 
      />

      {/* Content Container */}
      <div className="container position-relative h-100 d-flex align-items-center" style={{ zIndex: 10 }}>
        <div className="hb-content-box">
          <span className="hb-tag">{SLIDES[currentSlide].tag}</span>
          <h2 className="hb-title">{SLIDES[currentSlide].title}</h2>
          <h1 className="hb-highlight">{SLIDES[currentSlide].highlight}</h1>
          <p className="hb-subtitle">{SLIDES[currentSlide].subtitle}</p>
          <button 
            className="btn btn-success hb-cta-btn"
            onClick={() => navigate(SLIDES[currentSlide].link)}
          >
            {SLIDES[currentSlide].cta}
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button className="hb-nav-arrow hb-nav-prev" onClick={handlePrev} aria-label="Previous Slide">
        <ArrowLeft size={20} />
      </button>
      <button className="hb-nav-arrow hb-nav-next" onClick={handleNext} aria-label="Next Slide">
        <ArrowRight size={20} />
      </button>

      {/* Indicators */}
      <div className="hb-indicators">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`hb-dot ${idx === currentSlide ? 'hb-active' : ''}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
