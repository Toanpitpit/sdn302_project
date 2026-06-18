import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Spinner, Dropdown, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, XCircle, ArrowLeftRight, ChevronDown, Check, Info } from 'lucide-react';
import useToys from '../../hooks/useToys';
import toyService from '../../services/toyService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/pages/ListToy.css';

export default function ListToy() {
  const navigate = useNavigate();
  const {
    toys,
    loading,
    error,
    pagination,
    search,
    category,
    status,
    page,
    setFilters,
    setPage,
    activeFilterCount,
    clearFilters
  } = useToys();

  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(search);

  // Sync state search with input
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await toyService.getAllCategories();
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput });
  };

  const getStatusBadge = (toyStatus) => {
    const s = toyStatus?.toUpperCase();
    switch (s) {
      case 'AVAILABLE':
        return <Badge bg="success" className="public-toy-list-status-badge">Available</Badge>;
      case 'RENTED':
        return <Badge bg="danger" className="public-toy-list-status-badge">Rented</Badge>;
      case 'PENDING':
        return <Badge bg="warning" text="dark" className="public-toy-list-status-badge">Pending</Badge>;
      default:
        return <Badge bg="secondary" className="public-toy-list-status-badge">Unavailable</Badge>;
    }
  };

  const getCategoryName = (categoryField) => {
    if (typeof categoryField === 'string') return categoryField;
    if (Array.isArray(categoryField) && categoryField.length > 0) {
      return typeof categoryField[0] === 'string' ? categoryField[0] : categoryField[0].name;
    }
    return 'General';
  };

  return (
    <div className="public-list-toy-page">
      <Header />

      {/* Hero Banner Section */}
      <div className="public-list-toy-hero">
        <Container>
          <div className="text-center text-md-start">
            <h1 className="public-list-toy-hero-title">Browse Our Toy Library</h1>
            <p className="public-list-toy-hero-sub">Rent high-quality, verified toys for kids of all ages.</p>
          </div>
        </Container>
      </div>

      <Container className="my-5">
        {/* Search and Filtering Controls */}
        <Form onSubmit={handleSearchSubmit} className="public-search-filter-row mb-4">
          <Row className="g-3 align-items-center">
            {/* Search Bar */}
            <Col lg={5} md={12}>
              <InputGroup className="public-input-group border">
                <InputGroup.Text className="public-input-group-text">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  className="public-form-control"
                  placeholder="What toy are you looking for?"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <Button
                    variant="link"
                    className="public-clear-btn"
                    onClick={() => {
                      setSearchInput('');
                      setFilters({ search: '' });
                    }}
                  >
                    <XCircle size={16} />
                  </Button>
                )}
                <Button type="submit" className="public-search-submit-btn text-white">
                  Search
                </Button>
              </InputGroup>
            </Col>

            {/* Category Dropdown */}
            <Col lg={3} md={6}>
              <Dropdown className="w-100">
                <Dropdown.Toggle className="public-dropdown-toggle w-100 border">
                  <span>{category ? `Category: ${category}` : 'All Categories'}</span>
                  <ChevronDown size={16} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="public-dropdown-menu w-100 border-0 shadow">
                  <Dropdown.Item
                    className={`public-dropdown-item ${!category ? 'active' : ''}`}
                    onClick={() => setFilters({ category: '' })}
                  >
                    All Categories
                  </Dropdown.Item>
                  {categories.map((cat, idx) => (
                    <Dropdown.Item
                      key={idx}
                      className={`public-dropdown-item ${category === cat ? 'active' : ''}`}
                      onClick={() => setFilters({ category: cat })}
                    >
                      {cat}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>

            {/* Status Dropdown */}
            <Col lg={2} md={6}>
              <Dropdown className="w-100">
                <Dropdown.Toggle className="public-dropdown-toggle w-100 border">
                  <span>{status ? `Status: ${status}` : 'All Statuses'}</span>
                  <ChevronDown size={16} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="public-dropdown-menu w-100 border-0 shadow">
                  <Dropdown.Item
                    className={`public-dropdown-item ${!status ? 'active' : ''}`}
                    onClick={() => setFilters({ status: '' })}
                  >
                    All Statuses
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={`public-dropdown-item ${status === 'AVAILABLE' ? 'active' : ''}`}
                    onClick={() => setFilters({ status: 'AVAILABLE' })}
                  >
                    Available
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={`public-dropdown-item ${status === 'RENTED' ? 'active' : ''}`}
                    onClick={() => setFilters({ status: 'RENTED' })}
                  >
                    Rented
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>

            {/* Reset Button */}
            {activeFilterCount > 0 && (
              <Col lg={2} md={12} className="text-center text-lg-start">
                <Button
                  variant="outline-secondary"
                  className="public-clear-filters-btn w-100 rounded-pill"
                  onClick={() => {
                    setSearchInput('');
                    clearFilters();
                  }}
                >
                  Clear Filters
                </Button>
              </Col>
            )}
          </Row>
        </Form>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <div className="text-muted mt-2">Loading toys from library...</div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center py-4">
            <Info className="me-2" />
            {error}
          </div>
        ) : toys.length === 0 ? (
          <div className="text-center py-5 border rounded bg-white">
            <h5 className="text-muted">No toys found</h5>
            <p className="text-muted small">Try adjusting your filters or search criteria.</p>
          </div>
        ) : (
          <>
            <Row className="g-4">
              {toys.map((toy) => (
                <Col lg={3} md={4} sm={6} key={toy._id}>
                  <Card
                    className="public-toy-list-card h-100 shadow-sm border-0"
                    onClick={() => navigate(`/toys/${toy._id}`)}
                  >
                    <div className="public-toy-list-img-wrap">
                      <Card.Img
                        src={toy.thumbnail || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=400&h=300&fit=crop'}
                        className="public-toy-list-img"
                        alt={toy.title}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?q=80&w=400&h=300&fit=crop';
                        }}
                      />
                      {getStatusBadge(toy.status)}
                    </div>
                    <Card.Body className="p-3 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-success fw-bold small">
                            {getCategoryName(toy.category)}
                          </span>
                          <span className="text-muted small">Age: {toy.ageRange || 'Any'}</span>
                        </div>
                        <h6 className="public-toy-list-title mb-3" title={toy.title}>
                          {toy.title}
                        </h6>
                      </div>
                      <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                        <div>
                          <strong className="text-success">{(toy.pricePerHour || 8000).toLocaleString()}đ</strong>
                          <span className="text-muted small">/hr</span>
                        </div>
                        <span className="text-muted small">Deposit: {(toy.depositValue || 150000).toLocaleString()}đ</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="mb-0">
                  <Pagination.Prev
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  />
                  {[...Array(pagination.pages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === page}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={page === pagination.pages}
                    onClick={() => setPage(page + 1)}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>

      <Footer />
    </div>
  );
}
