import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Pagination, Card, Badge, InputGroup, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, ChevronDown, Heart } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import useToys from '../../hooks/useToys';
import useAuth from '../../hooks/useAuth';
import toyService from '../../services/toyService';
import userService from '../../services/userService';
import '../../styles/pages/ListToy.css';

const STATUS_BADGE = {
  AVAILABLE: { bg: 'success', label: 'Có sẵn' },
  PENDING: { bg: 'warning', label: 'Đang chờ' },
  RENTED: { bg: 'danger', label: 'Đang thuê' },
  UNAVAILABLE: { bg: 'secondary', label: 'Không có' },
};

function ToyCard({ toy, onClick }) {
  const currentStatus = (toy.status || '').toUpperCase();
  const badge = STATUS_BADGE[currentStatus] || { bg: 'secondary', label: currentStatus };

  const { userProfile, toggleFavoriteWrapper } = useAuth();
  const isFavorite = userProfile?.favoriteToys?.includes(toy._id);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!userProfile) {
        return;
    }
    await toggleFavoriteWrapper(toy._id);
  };

  return (
    <Card className="h-100 public-toy-list-card shadow-sm" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="public-toy-list-img-wrap" style={{ position: 'relative' }}>
        <button
            onClick={handleFavoriteClick}
            style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                padding: '6px',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            title={isFavorite ? "Gỡ khỏi yêu thích" : "Thêm vào yêu thích"}
        >
            <Heart size={18} fill={isFavorite ? '#ff4757' : 'none'} color={isFavorite ? '#ff4757' : '#6b7280'} />
        </button>
        <Card.Img
          variant="top"
          src={toy.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
          className="public-toy-list-img"
          onError={(e) => { 
            if (e.target.src !== 'https://via.placeholder.com/300x200?text=No+Image') {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; 
            }
          }}
        />
        <Badge bg={badge.bg} className="public-toy-list-status-badge">{badge.label}</Badge>
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="text-muted small mb-1">{toy.category}</div>
        <Card.Title className="public-list-toy-title">{toy.title}</Card.Title>
        <div className="mt-auto pt-2 border-top">
          <div className="fw-bold text-success">
            {toy.pricePerHour?.toLocaleString('vi-VN')}đ
            <span className="text-muted fw-normal">/giờ</span>
          </div>
          <div className="text-muted small">Cọc: {toy.depositValue?.toLocaleString('vi-VN')}đ</div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function ListToy() {
  const navigate = useNavigate();
  const {
    toys, loading, error, pagination,
    search, category, status, page,
    setFilters, setPage, activeFilterCount, clearFilters,
  } = useToys();

  const { userProfile } = useAuth();

  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(search);
  
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteToysList, setFavoriteToysList] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    if (showFavoritesOnly && userProfile) {
      setLoadingFavorites(true);
      userService.getFavorites().then(res => {
        if (res.success) setFavoriteToysList(res.data);
        setLoadingFavorites(false);
      });
    }
  }, [showFavoritesOnly, userProfile?.favoriteToys]); // listen to favoriteToys to auto refresh when toggled


  useEffect(() => {
    toyService.getAllCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);


  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput.trim(), category, status });
  };

  const handleCategoryChange = (e) => {
    setFilters({ search, category: e.target.value, status });
  };

  const handleStatusChange = (e) => {
    setFilters({ search, category, status: e.target.value });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFilters({ search: '', category, status });
  };

  const pageRange = () => {
    const total = pagination.pages || 1;
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(total, page + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="public-list-toy-wrapper">
      <Header navigate={navigate} />
      <div className="public-list-toy-page">
        <div className="public-list-toy-hero">
          <Container>
            <h1 className="public-list-toy-hero-title">🧸 Khám phá Đồ Chơi</h1>
            <p className="public-list-toy-hero-sub">Tìm kiếm và thuê đồ chơi yêu thích cho bé</p>

            {/* Toggle cho Yêu thích nếu đã login */}
            {userProfile && (
              <Row className="justify-content-center mb-4">
                <Col xs="auto">
                  <div className="d-flex bg-white rounded-pill p-1 shadow-sm border">
                    <Button 
                      variant={!showFavoritesOnly ? "success" : "light"} 
                      className={`rounded-pill px-4 fw-medium border-0 ${!showFavoritesOnly ? '' : 'text-secondary'}`}
                      onClick={() => setShowFavoritesOnly(false)}
                    >
                      Tất cả đồ chơi
                    </Button>
                    <Button 
                      variant={showFavoritesOnly ? "success" : "light"} 
                      className={`rounded-pill px-4 fw-medium border-0 ${showFavoritesOnly ? '' : 'text-secondary'}`}
                      onClick={() => setShowFavoritesOnly(true)}
                    >
                      <Heart size={16} className={showFavoritesOnly ? "me-2 text-white" : "me-2 text-danger"} fill="currentColor" /> Đồ chơi yêu thích
                    </Button>
                  </div>
                </Col>
              </Row>
            )}

            {/* Search & Filter bar - Chỉ show khi đang ở chế độ xem tất cả */}
            {!showFavoritesOnly && (
              <Row className="g-2 align-items-end justify-content-center public-search-filter-row">
                <Col xs={12} md={5}>
                <Form onSubmit={handleSearch} className="public-search-form">
                  <InputGroup className="public-input-group">
                    <InputGroup.Text className="bg-white border-end-0 public-input-group-text">
                      <Search size={16} color="#6b7280" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tìm theo tên đồ chơi..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="border-start-0 border-end-0 public-form-control"
                      id="toy-search-input"
                    />
                    {searchInput && (
                      <Button variant="outline-secondary" onClick={handleClearSearch} className="border-start-0 public-clear-btn">
                        <X size={14} />
                      </Button>
                    )}
                    <Button type="submit" variant="success" className="public-search-submit-btn">Tìm</Button>
                  </InputGroup>
                </Form>
              </Col>

              <Col xs={12} md={3}>
                <Dropdown className="public-input-group public-dropdown-wrap">
                  <Dropdown.Toggle variant="light" className="public-dropdown-toggle w-100">
                    <div className="d-flex align-items-center gap-2">
                      <Filter size={14} color="#6b7280" />
                      <span className="text-truncate">{category || 'Tất cả danh mục'}</span>
                    </div>
                    <ChevronDown size={14} color="#6b7280" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="public-dropdown-menu w-100">
                    <Dropdown.Item 
                      active={!category} 
                      onClick={() => setFilters({ search, category: '', status })}
                      className="public-dropdown-item"
                    >
                      Tất cả danh mục
                    </Dropdown.Item>
                    {categories.map((cat) => (
                      <Dropdown.Item 
                        key={cat} 
                        active={category === cat}
                        onClick={() => setFilters({ search, category: cat, status })}
                        className="public-dropdown-item"
                      >
                        {cat}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>

              <Col xs={12} md={2}>
                <Dropdown className="public-input-group public-dropdown-wrap">
                  <Dropdown.Toggle variant="light" className="public-dropdown-toggle w-100">
                    <span className="text-truncate">
                      {status === 'AVAILABLE' ? 'Sẵn sàng' : status === 'RENTED' ? 'Đang thuê' : 'Tất cả trạng thái'}
                    </span>
                    <ChevronDown size={14} color="#6b7280" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="public-dropdown-menu w-100">
                    <Dropdown.Item 
                      active={!status} 
                      onClick={() => handleStatusChange({ target: { value: '' } })}
                      className="public-dropdown-item"
                    >
                      Tất cả trạng thái
                    </Dropdown.Item>
                    <Dropdown.Item 
                      active={status === 'AVAILABLE'}
                      onClick={() => handleStatusChange({ target: { value: 'AVAILABLE' } })}
                      className="public-dropdown-item"
                    >
                      Sẵn sàng (Mượn được)
                    </Dropdown.Item>
                    <Dropdown.Item 
                      active={status === 'RENTED'}
                      onClick={() => handleStatusChange({ target: { value: 'RENTED' } })}
                      className="public-dropdown-item"
                    >
                      Đang được thuê
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>

              {activeFilterCount > 0 && (
                <Col xs="auto">
                  <Button variant="outline-light" onClick={clearFilters} className="public-clear-filters-btn">
                    <X size={14} className="me-1" />
                    Xóa các bộ lọc ({activeFilterCount})
                  </Button>
                </Col>
              )}
            </Row>
            )}
          </Container>
        </div>

        <Container className="py-4">
          {/* Kết quả */}
          {!showFavoritesOnly && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="text-muted small">
                {loading ? 'Đang tải...' : `Tìm thấy ${pagination.total ?? 0} kết quả`}
                {search && <span className="ms-1">cho "<strong>{search}</strong>"</span>}
                {category && <span className="ms-1">trong <strong>{category}</strong></span>}
              </div>
            </div>
          )}

          {showFavoritesOnly && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="text-muted small">
                 {loadingFavorites ? 'Đang tải...' : `Bạn có ${favoriteToysList.length} đồ chơi yêu thích`}
              </div>
            </div>
          )}

          {/* States */}
          {(showFavoritesOnly ? loadingFavorites : loading) ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="text-muted mt-2">Đang tải đồ chơi...</p>
            </div>
          ) : !showFavoritesOnly && error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (showFavoritesOnly ? favoriteToysList.length === 0 : toys.length === 0) ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: 48 }}>{showFavoritesOnly ? '❤️' : '🔍'}</div>
              <h5>{showFavoritesOnly ? 'Chưa có đồ chơi yêu thích' : 'Không tìm thấy đồ chơi phù hợp'}</h5>
              <p>{showFavoritesOnly ? 'Hãy thêm đồ chơi bạn thích bằng cách bấm vào biểu tượng 💖 nhé' : 'Hãy thử thay đổi từ khóa hoặc danh mục'}</p>
              {!showFavoritesOnly && activeFilterCount > 0 && (
                <Button variant="outline-success" onClick={clearFilters}>Xóa bộ lọc</Button>
              )}
            </div>
          ) : (
            <>
              <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                {(showFavoritesOnly ? favoriteToysList : toys).map((toy) => (
                  <Col key={toy._id}>
                    <ToyCard toy={toy} onClick={() => navigate(`/toys/${toy._id}`)} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {!showFavoritesOnly && pagination.pages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                    <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />
                    {page > 3 && <Pagination.Ellipsis disabled />}
                    {pageRange().map((p) => (
                      <Pagination.Item key={p} active={page === p} onClick={() => setPage(p)}>
                        {p}
                      </Pagination.Item>
                    ))}
                    {page < (pagination.pages - 2) && <Pagination.Ellipsis disabled />}
                    <Pagination.Next onClick={() => setPage(page + 1)} disabled={page === pagination.pages} />
                    <Pagination.Last onClick={() => setPage(pagination.pages)} disabled={page === pagination.pages} />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
}
