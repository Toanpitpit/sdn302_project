import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, CreditCard, XCircle, Info, CalendarRange, MapPin, CheckCircle, ExternalLink } from 'lucide-react';
import bookingService from '../../services/bookingService';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';
import '../../styles/pages/BookingsPage.css';

export default function BookingsPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookings();
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load your rentals list.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle VNPay Callback URL params on mount
  useEffect(() => {
    const status = searchParams.get('status');
    const bookingId = searchParams.get('bookingId');
    const message = searchParams.get('message');

    if (status) {
      if (status === 'success') {
        toast.success(`Payment successful for booking #${bookingId?.slice(-6).toUpperCase() || ''}!`);
      } else {
        toast.error(`Payment failed: ${message || 'Unknown error'}`);
      }
      // Clear URL params to avoid repeating toast on refresh
      navigate('/bookings', { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (!userProfile) {
      // If not logged in, redirect to login
      toast.info('Please log in to view your bookings.');
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [userProfile, fetchBookings, navigate]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      const res = await bookingService.cancelBooking(bookingId);
      if (res.success) {
        toast.success(res.message || 'Booking cancelled successfully.');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePay = async (bookingId) => {
    try {
      const res = await bookingService.getPaymentUrl(bookingId);
      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.error('Could not generate VNPay URL.');
      }
    } catch (err) {
      toast.error('Failed to connect to payment provider.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_APPROVED':
        return <Badge bg="warning" text="dark" className="rounded-pill">Awaiting Approval</Badge>;
      case 'WAITING_PAYMENT':
        return <Badge bg="info" className="rounded-pill">Awaiting Payment</Badge>;
      case 'APPROVED':
        return <Badge bg="success" className="rounded-pill">Approved</Badge>;
      case 'ACTIVE':
        return <Badge bg="primary" className="rounded-pill">Active Rental</Badge>;
      case 'CANCELLED':
        return <Badge bg="secondary" className="rounded-pill">Cancelled</Badge>;
      case 'REJECTED':
        return <Badge bg="danger" className="rounded-pill">Rejected</Badge>;
      default:
        return <Badge bg="light" text="dark" className="rounded-pill">{status}</Badge>;
    }
  };

  const getCategoryName = (categoryField) => {
    if (typeof categoryField === 'string') return categoryField;
    if (Array.isArray(categoryField) && categoryField.length > 0) {
      return typeof categoryField[0] === 'string' ? categoryField[0] : categoryField[0].name;
    }
    return 'General';
  };

  if (!userProfile) return null;

  return (
    <div className="bookings-page-wrapper">
      <Header />

      <Container className="py-5">
        <div className="mb-4">
          <h2 className="fw-bold">My Toy Rentals</h2>
          <p className="text-muted">Track your booking requests, payments, and active toy rentals.</p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <div className="text-muted mt-2">Loading your rentals history...</div>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="text-center p-5 border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="display-1 text-success mb-3">
                <CalendarRange size={72} className="mx-auto" />
              </div>
              <h4 className="fw-bold">No active rentals found</h4>
              <p className="text-muted mb-4">You haven't requested any toys yet. Start exploring our premium collection!</p>
              <Button as={Link} to="/toys" variant="success" className="px-4 py-2 rounded-pill fw-bold">
                Browse Toys
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 text-nowrap">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Toy Details</th>
                    <th className="py-3">Start Date</th>
                    <th className="py-3">End Date</th>
                    <th className="py-3">Total Amount</th>
                    <th className="py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={booking.toyId?.thumbnail || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=100&h=100&fit=crop'}
                            alt=""
                            className="rounded-3 border"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=100&h=100&fit=crop';
                            }}
                          />
                          <div>
                            <div className="fw-semibold text-dark" style={{ fontSize: '0.92rem' }}>
                              {booking.toyId?.title || 'Unknown Toy'}
                            </div>
                            <span className="text-success small" style={{ fontSize: '0.78rem' }}>
                              {getCategoryName(booking.toyId?.category)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="small text-muted">
                          {new Date(booking.startDate).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className="small text-muted">
                          {new Date(booking.endDate).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold text-success" style={{ fontSize: '0.92rem' }}>
                          {(booking.totalAmount || 0).toLocaleString()}đ
                        </div>
                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          Deposit: {(booking.depositAmount || 0).toLocaleString()}đ
                        </span>
                      </td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td className="px-4 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          {booking.status === 'WAITING_PAYMENT' && (
                            <Button
                              variant="success"
                              size="sm"
                              className="d-flex align-items-center gap-1 px-3 rounded-pill fw-bold"
                              onClick={() => handlePay(booking._id)}
                            >
                              <CreditCard size={14} /> Pay Now
                            </Button>
                          )}

                          {['PENDING_APPROVED', 'WAITING_PAYMENT'].includes(booking.status) && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="d-flex align-items-center gap-1 px-3 rounded-pill fw-bold"
                              onClick={() => handleCancel(booking._id)}
                              disabled={cancellingId === booking._id}
                            >
                              <XCircle size={14} /> Cancel
                            </Button>
                          )}

                          {!['PENDING_APPROVED', 'WAITING_PAYMENT'].includes(booking.status) && (
                            <Button
                              as={Link}
                              to={`/toys/${booking.toyId?._id}`}
                              variant="outline-primary"
                              size="sm"
                              className="px-3 rounded-pill fw-bold"
                            >
                              View Toy
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </Container>

      <Footer />
    </div>
  );
}
