import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import toyService from '../services/toyService';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';
import '../styles/components/PopularToys.css';

const MOCK_POPULAR = [
  {
    _id: 'mock-p1',
    title: 'Hot Wheels Ultimate Garage Playset',
    category: 'Car',
    pricePerHour: 10000,
    depositValue: 300000,
    thumbnail: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=400&h=300&fit=crop',
    status: 'AVAILABLE',
    rating: 4.8,
    reviewsCount: 19
  },
  {
    _id: 'mock-p2',
    title: 'Fisher-Price Kick \'n Play Piano Gym',
    category: 'Educational',
    pricePerHour: 8000,
    depositValue: 150000,
    thumbnail: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=400&h=300&fit=crop',
    status: 'AVAILABLE',
    rating: 4.9,
    reviewsCount: 34
  },
  {
    _id: 'mock-p3',
    title: 'Catan Strategy Board Game',
    category: 'Board Games',
    pricePerHour: 5000,
    depositValue: 100000,
    thumbnail: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=400&h=300&fit=crop',
    status: 'AVAILABLE',
    rating: 4.6,
    reviewsCount: 15
  },
  {
    _id: 'mock-p4',
    title: 'Barbie Dreamhouse 3-Story Dollhouse',
    category: 'Dolls & Playsets',
    pricePerHour: 18000,
    depositValue: 600000,
    thumbnail: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?q=80&w=400&h=300&fit=crop',
    status: 'AVAILABLE',
    rating: 4.8,
    reviewsCount: 22
  }
];

export default function PopularToys() {
  const { userProfile, toggleFavoriteWrapper } = useAuth();
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPopular() {
      try {
        const res = await toyService.getAllToys({ limit: 4, status: 'AVAILABLE' });
        if (res.success && res.data && res.data.length > 0) {
          setToys(res.data.slice(0, 4));
        } else {
          setToys(MOCK_POPULAR);
        }
      } catch (err) {
        console.error('Error fetching popular toys:', err);
        setToys(MOCK_POPULAR);
      } finally {
        setLoading(false);
      }
    }
    loadPopular();
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
    <section className="pt-section">
      <Container>
        <div className="pt-header">
          <div>
            <h2 className="pt-title">Trending Toys</h2>
            <p className="pt-subtitle">Explore what kids in your neighborhood are playing with right now</p>
          </div>
          <Link to="/toys" className="pt-view-all">
            See All &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <Row className="g-4">
            {toys.map((toy) => (
              <Col lg={3} md={6} sm={6} key={toy._id}>
                <Card className="ptc-card" onClick={() => navigate(`/toys/${toy._id}`)}>
                  <div className="ptc-img-container">
                    <Card.Img
                      src={toy.thumbnail || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=400&h=300&fit=crop'}
                      className="ptc-img w-100 h-100"
                      alt={toy.title}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=400&h=300&fit=crop';
                      }}
                    />
                    <span className="ptc-badge badge text-white">
                      {getCategoryName(toy.category)}
                    </span>
                    <button
                      className="ptc-like-btn text-center"
                      onClick={(e) => handleFavoriteClick(e, toy._id)}
                      aria-label="Like"
                    >
                      <Heart
                        size={14}
                        className={isFavorite(toy._id) ? 'fill-danger text-danger' : 'text-muted'}
                        style={{ fill: isFavorite(toy._id) ? '#ff4757' : 'none', color: isFavorite(toy._id) ? '#ff4757' : '#747d8c' }}
                      />
                    </button>
                  </div>
                  <Card.Body className="ptc-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="ptc-name" title={toy.title}>
                        {toy.title}
                      </h5>
                      <div className="ptc-rating">
                        <Star size={12} fill="#f59e0b" stroke="none" />
                        <span className="ptc-rating-value">{toy.rating || '4.8'}</span>
                        <span className="ptc-rating-count">({toy.reviewsCount || '10'})</span>
                      </div>
                    </div>
                    <div className="ptc-footer">
                      <div className="ptc-price">
                        {(toy.pricePerHour || 8000).toLocaleString()}đ<span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 'normal' }}> / hr</span>
                      </div>
                      <button className="ptc-rent-btn">
                        Rent
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}
