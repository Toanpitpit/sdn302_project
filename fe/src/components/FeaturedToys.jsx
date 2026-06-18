import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import toyService from '../services/toyService';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';
import '../styles/components/FeaturedToys.css';

const MOCK_FEATURED = [
  {
    _id: 'mock-f1',
    title: 'LEGO Star Wars Millennium Falcon 75192',
    category: 'LEGO',
    pricePerHour: 15000,
    depositValue: 500000,
    description: 'Welcome to the largest, most detailed LEGO Star Wars Millennium Falcon model we’ve ever created. Perfect for block builders and Star Wars fans looking for an ultimate build experience.',
    thumbnail: 'https://images.unsplash.com/photo-1585366119957-e5730b3d58cd?q=80&w=600&h=400&fit=crop',
    status: 'AVAILABLE',
    rating: 4.9,
    reviewsCount: 42
  },
  {
    _id: 'mock-f2',
    title: 'DJI Tello Ryze Coding Drone',
    category: 'Educational',
    pricePerHour: 20000,
    depositValue: 800000,
    description: 'Perform flying stunts, shoot quick videos with EZ Shots, and learn code with Scratch programming. An awesome drone for kids that helps them learn robotics and coding.',
    thumbnail: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=600&h=400&fit=crop',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewsCount: 28
  }
];

export default function FeaturedToys() {
  const { userProfile, toggleFavoriteWrapper } = useAuth();
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await toyService.getFeaturedToys();
        if (res.success && res.data && res.data.length > 0) {
          setToys(res.data.slice(0, 2)); // Show top 2 featured toys in horizontal view
        } else {
          setToys(MOCK_FEATURED);
        }
      } catch (err) {
        console.error('Error fetching featured toys:', err);
        setToys(MOCK_FEATURED);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleFavoriteClick = async (e, toyId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!userProfile) {
      toast.info('Please log in to add toys to your favorites!');
      navigate('/login');
      return;
    }
    try {
      const res = await toggleFavoriteWrapper(toyId);
      if (res.success) {
        toast.success(res.message || 'Updated favorites!');
      }
    } catch (err) {
      toast.error('Could not update favorites. Try again later.');
    }
  };

  const getCategoryName = (categoryField) => {
    if (typeof categoryField === 'string') return categoryField;
    if (Array.isArray(categoryField) && categoryField.length > 0) {
      return typeof categoryField[0] === 'string' ? categoryField[0] : categoryField[0].name;
    }
    return 'General';
  };

  const isFavorite = (toyId) => {
    return userProfile?.favoriteToys?.some((fav) => fav._id === toyId || fav === toyId);
  };

  return (
    <section className="ft-section">
      <Container>
        <div className="ft-header">
          <div>
            <h2 className="ft-title">Editor's Choice</h2>
            <p className="ft-subtitle">Our most popular and highly recommended premium toys this week</p>
          </div>
          <Link to="/toys" className="ft-view-all">
            View All Toys &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <Row className="g-4">
            {toys.map((toy) => (
              <Col lg={6} key={toy._id}>
                <Card className="ftc-card h-100">
                  <Row className="g-0 h-100 align-items-stretch">
                    <Col md={5} className="ftc-img-col position-relative">
                      <Card.Img
                        src={toy.thumbnail || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=400&h=400&fit=crop'}
                        className="ftc-img h-100 w-100"
                        alt={toy.title}
                        onClick={() => navigate(`/toys/${toy._id}`)}
                        style={{ cursor: 'pointer' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=400&h=400&fit=crop';
                        }}
                      />
                      <span className="ftc-badge" style={{ backgroundColor: '#3cb14a' }}>
                        {getCategoryName(toy.category)}
                      </span>
                      <button
                        className="ftc-like-btn"
                        onClick={(e) => handleFavoriteClick(e, toy._id)}
                        aria-label="Like"
                      >
                        <Heart
                          size={18}
                          className={isFavorite(toy._id) ? 'fill-danger text-danger' : 'text-muted'}
                          style={{ fill: isFavorite(toy._id) ? '#ff4757' : 'none', color: isFavorite(toy._id) ? '#ff4757' : '#747d8c' }}
                        />
                      </button>
                    </Col>
                    <Col md={7}>
                      <Card.Body className="ftc-body d-flex flex-column h-100 justify-content-between">
                        <div>
                          <h4 
                            className="ftc-title cursor-pointer text-truncate-2"
                            onClick={() => navigate(`/toys/${toy._id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            {toy.title}
                          </h4>
                          <div className="ftc-rating-box">
                            <Star size={16} className="ftc-star-icon" />
                            <span className="ftc-rating-val">{toy.rating || '4.8'}</span>
                            <span className="ftc-reviews">({toy.reviewsCount || '15'} reviews)</span>
                          </div>
                          <p className="ftc-desc">{toy.description || 'Experience immersive gaming and build sessions with premium, clean toys. Order now for safe and verified enjoyment.'}</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top w-100">
                          <div>
                            <span className="ftc-price">{(toy.pricePerHour || 15000).toLocaleString()}đ</span>
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>/ hr</span>
                          </div>
                          <Button
                            onClick={() => navigate(`/toys/${toy._id}`)}
                            className="ftc-rent-btn"
                          >
                            Rent Now
                          </Button>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}
