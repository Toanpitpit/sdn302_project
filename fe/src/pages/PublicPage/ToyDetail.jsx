import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Spinner, Badge, Alert } from 'react-bootstrap';
import { Calendar, Shield, Heart, MapPin, CheckCircle, Info, Sparkles, Box, Hammer, Activity, Star, User } from 'lucide-react';
import toyService from '../../services/toyService';
import bookingService from '../../services/bookingService';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';
import '../../styles/pages/ToyDetail.css';

export default function ToyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile, toggleFavoriteWrapper } = useAuth();

  const [toy, setToy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentType, setPaymentType] = useState('cod');
  const [message, setMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function loadToy() {
      try {
        setLoading(true);
        const [res, reviewRes] = await Promise.all([
          toyService.getToyById(id),
          toyService.getToyReviews(id).catch(() => ({ success: true, data: [] }))
        ]);
        if (res.success) {
          setToy(res.data);
          setActiveImage(res.data.thumbnail || '');
        } else {
          toast.error(res.message || 'Could not load toy detail');
        }
        if (reviewRes && reviewRes.success) {
          setReviews(reviewRes.data || []);
        }
      } catch (err) {
        toast.error('Server error loading toy details');
      } finally {
        setLoading(false);
      }
    }
    loadToy();
  }, [id]);

  const handleFavoriteClick = async () => {
    if (!userProfile) {
      toast.info('Please log in to add toys to your favorites!');
      navigate('/login');
      return;
    }
    try {
      const res = await toggleFavoriteWrapper(toy._id);
      if (res.success) {
        toast.success(res.message || 'Updated favorites!');
      }
    } catch (err) {
      toast.error('Could not update favorites.');
    }
  };

  const isFavorite = () => {
    return userProfile?.favoriteToys?.some((fav) => fav._id === toy?._id || fav === toy?._id);
  };

  // Cost calculation
  const getRentHours = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffMs = end - start;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60));
  };

  const getEstimatedCost = () => {
    const hours = getRentHours();
    if (hours <= 0 || !toy) return { fare: 0, deposit: 0, total: 0 };
    const fare = hours * toy.pricePerHour;
    const deposit = toy.depositValue;
    return {
      hours,
      fare,
      deposit,
      total: fare + deposit
    };
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!userProfile) {
      toast.info('Please login to rent this toy.');
      navigate('/login', { state: { from: `/toys/${id}` } });
      return;
    }

    const hours = getRentHours();
    if (hours <= 0) {
      toast.error('Start date must be before end date.');
      return;
    }
    if (hours < 1) {
      toast.error('Minimum rental duration is 1 hour.');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        toyId: toy._id,
        startDate,
        endDate,
        paymentType,
        message
      };

      const res = await bookingService.createBooking(payload);
      if (res.success) {
        setBookingSuccess(true);
        toast.success(res.message || 'Booking request submitted!');

        // If VNPay is selected, redirect to VNPay payment URL after validation
        if (paymentType === 'vnpay' && res.data?.status === 'WAITING_PAYMENT') {
          try {
            const payRes = await bookingService.getPaymentUrl(res.data._id);
            if (payRes.success && payRes.paymentUrl) {
              window.location.href = payRes.paymentUrl;
              return;
            }
          } catch (payErr) {
            console.error('VNPay redirect failed', payErr);
            toast.warn('Failed to redirect to VNPay. You can pay later in My Bookings.');
          }
        }

        setTimeout(() => {
          navigate('/bookings');
        }, 2500);
      } else {
        toast.error(res.message || 'Failed to submit booking.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Server error submitting rental request.';
      toast.error(errMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusBadge = (toyStatus) => {
    const s = toyStatus?.toUpperCase();
    switch (s) {
      case 'AVAILABLE':
        return <Badge bg="success" className="toy-detail-status-badge">Available</Badge>;
      case 'RENTED':
        return <Badge bg="danger" className="toy-detail-status-badge">Rented</Badge>;
      case 'PENDING':
        return <Badge bg="warning" text="dark" className="toy-detail-status-badge">Pending</Badge>;
      default:
        return <Badge bg="secondary" className="toy-detail-status-badge">Unavailable</Badge>;
    }
  };

  const getCategoryName = (categoryField) => {
    if (typeof categoryField === 'string') return categoryField;
    if (Array.isArray(categoryField) && categoryField.length > 0) {
      return typeof categoryField[0] === 'string' ? categoryField[0] : categoryField[0].name;
    }
    return 'General';
  };

  if (loading) {
    return (
      <div className="toy-detail-page">
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="success" />
          <div className="text-muted mt-2">Loading toy details...</div>
        </Container>
        <Footer />
      </div>
    );
  }

  if (!toy) {
    return (
      <div className="toy-detail-page">
        <Header />
        <Container className="py-5 text-center">
          <Alert variant="warning">Toy not found or has been removed.</Alert>
          <Button as={Link} to="/toys" variant="success" className="mt-3">Back to Browse</Button>
        </Container>
        <Footer />
      </div>
    );
  }

  const { hours, fare, deposit, total } = getEstimatedCost();
  const allImages = [toy.thumbnail, ...(toy.images || [])].filter(Boolean);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.stars, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="toy-detail-page">
      <Header />

      {/* Breadcrumb strip */}
      <div className="toy-detail-breadcrumb">
        <Container>
          <div className="d-flex align-items-center gap-1 text-muted">
            <Link to="/" className="text-decoration-none text-muted">Home</Link>
            <span>/</span>
            <Link to="/toys" className="text-decoration-none text-muted">Browse</Link>
            <span>/</span>
            <span className="text-dark text-truncate">{toy.title}</span>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-4">
          {/* Left Column: Images and Details */}
          <Col lg={7}>
            {/* Main Image View */}
            <div className="toy-detail-main-img-wrap mb-3">
              <img
                src={activeImage || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=600&h=600&fit=crop'}
                className="toy-detail-main-img"
                alt={toy.title}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=600&h=600&fit=crop';
                }}
              />
              {getStatusBadge(toy.status)}
            </div>

            {/* Thumbnail Slides */}
            {allImages.length > 1 && (
              <Row className="g-2 mb-4">
                {allImages.map((img, idx) => (
                  <Col xs={2} key={idx}>
                    <img
                      src={img}
                      alt=""
                      className={`toy-detail-thumb ${activeImage === img ? 'active' : ''}`}
                      onClick={() => setActiveImage(img)}
                    />
                  </Col>
                ))}
              </Row>
            )}

            {/* Toy Specifications & Info */}
            <div className="bg-white p-4 border rounded-4 shadow-sm mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Box size={20} className="text-success" />
                Product Details
              </h5>
              <div className="toy-detail-info-chips mb-4">
                <div className="toy-detail-chip">
                  <Sparkles size={14} />
                  <span>Category: {getCategoryName(toy.category)}</span>
                </div>
                {toy.ageRange && (
                  <div className="toy-detail-chip">
                    <Activity size={14} />
                    <span>Age: {toy.ageRange}</span>
                  </div>
                )}
                {toy.origin && (
                  <div className="toy-detail-chip">
                    <MapPin size={14} />
                    <span>Origin: {toy.origin}</span>
                  </div>
                )}
              </div>

              <h6 className="fw-bold mb-2">Specifications</h6>
              <ul className="toy-detail-specs list-unstyled">
                <li><strong>Material:</strong> {toy.specifications?.material || 'Safe plastic'}</li>
                <li><strong>Size:</strong> {toy.specifications?.size || 'Standard package'}</li>
                <li><strong>Weight:</strong> {toy.specifications?.weight || 'N/A'}</li>
                <li><strong>Batteries Required:</strong> {toy.specifications?.requiresBattery ? 'Yes' : 'No'}</li>
              </ul>

              <h6 className="fw-bold mt-4 mb-2">Description</h6>
              <p className="text-muted leading-relaxed" style={{ fontSize: '0.95rem' }}>
                {toy.description || 'This premium toy is thoroughly cleaned, checked and packaged in accordance with safety standards. It offers excellent interactive opportunities and helps children build logical coordination.'}
              </p>
            </div>
          </Col>

          {/* Right Column: Checkout/Booking Sidebar */}
          <Col lg={5}>
            {bookingSuccess ? (
              <div className="bg-white p-5 border rounded-4 shadow-sm text-center">
                <div className="success-checkmark mb-4">
                  <div className="check-icon">
                    <div className="icon-line line-tip"></div>
                    <div className="icon-line line-long"></div>
                    <div className="icon-circle"></div>
                    <div className="icon-fix"></div>
                  </div>
                </div>
                <h4 className="fw-bold text-success mb-2">Booking Success!</h4>
                <p className="text-muted small">
                  Your rental request has been submitted. You will be redirected to your bookings page shortly.
                </p>
              </div>
            ) : (
              <div className="toy-detail-booking-form">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="toy-detail-title mb-1">{toy.title}</h2>
                    <div className="toy-detail-price-box">
                      <span className="toy-detail-price">{(toy.pricePerHour || 8000).toLocaleString()}đ</span>
                      <span className="toy-detail-price-unit">/ hour</span>
                    </div>
                  </div>
                  <button
                    className="btn border rounded-circle p-2 shadow-sm bg-white"
                    onClick={handleFavoriteClick}
                  >
                    <Heart
                      size={20}
                      className={isFavorite() ? 'fill-danger text-danger' : 'text-muted'}
                      style={{ fill: isFavorite() ? '#ff4757' : 'none', color: isFavorite() ? '#ff4757' : '#747d8c' }}
                    />
                  </button>
                </div>

                <Alert variant="info" className="py-2 px-3 small border-0 bg-light-success text-success d-flex align-items-center gap-2">
                  <Shield size={16} />
                  <span>Security Deposit Required: <strong>{toy.depositValue.toLocaleString()}đ</strong></span>
                </Alert>

                <Form onSubmit={handleBookingSubmit} className="mt-4">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Start Rental Date & Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      required
                      value={startDate}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">End Rental Date & Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      required
                      value={endDate}
                      min={startDate || new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Payment Method</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        label="COD (Pay on Delivery)"
                        name="paymentType"
                        id="payment-cod"
                        checked={paymentType === 'cod'}
                        onChange={() => setPaymentType('cod')}
                      />
                      <Form.Check
                        type="radio"
                        label="VNPay (E-Wallet/Bank)"
                        name="paymentType"
                        id="payment-vnpay"
                        checked={paymentType === 'vnpay'}
                        onChange={() => setPaymentType('vnpay')}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small">Message to Staff (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Add any specific requests..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </Form.Group>

                  {/* Calculations Preview */}
                  {hours > 0 && (
                    <div className="toy-detail-estimate">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Duration:</span>
                        <strong>{hours} hours</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Rental Fare:</span>
                        <span>{fare.toLocaleString()}đ</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Deposit Fee (refundable):</span>
                        <span>{deposit.toLocaleString()}đ</span>
                      </div>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between fw-bold text-success" style={{ fontSize: '1.05rem' }}>
                        <span>Total Checkout:</span>
                        <span>{total.toLocaleString()}đ</span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="success"
                    className="w-100 py-3 rounded-pill fw-bold"
                    disabled={bookingLoading || toy.status !== 'AVAILABLE'}
                  >
                    {bookingLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : toy.status !== 'AVAILABLE' ? (
                      'Toy Unavailable'
                    ) : (
                      'Request Rental'
                    )}
                  </Button>
                </Form>
              </div>
            )}
          </Col>
        </Row>

        {/* Reviews Section */}
        <Row className="mt-5">
          <Col lg={12}>
            <div className="bg-white p-4 border rounded-4 shadow-sm">
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <Star size={24} className="text-warning fill-warning" style={{ fill: '#ffc107' }} />
                Customer Reviews ({reviews.length})
                {reviews.length > 0 && <span className="ms-2 badge bg-success fs-6">{averageRating} / 5</span>}
              </h4>
              
              {reviews.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p className="mb-0">No reviews yet for this toy. Rent it and be the first to leave a review!</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="d-flex gap-3 border-bottom pb-4 last-border-0">
                      <div className="flex-shrink-0">
                        {review.fromUserId?.avatar ? (
                          <img 
                            src={review.fromUserId.avatar} 
                            alt={review.fromUserId.name} 
                            className="rounded-circle"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-muted" style={{ width: '48px', height: '48px' }}>
                            <User size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <h6 className="fw-bold mb-0">{review.fromUserId?.name || 'Anonymous User'}</h6>
                          <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div className="d-flex mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={14} 
                              className={star <= review.stars ? 'text-warning' : 'text-muted'} 
                              style={{ fill: star <= review.stars ? '#ffc107' : 'none', marginRight: '2px' }}
                            />
                          ))}
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}
