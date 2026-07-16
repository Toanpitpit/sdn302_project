import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Form, Button, Badge, Spinner,
  Modal, Row, Col, Alert, Pagination, InputGroup, Card
} from 'react-bootstrap';
import { Search, CheckCircle, XCircle, Package, ClipboardCheck, Camera, Plus, Eye, User, Calendar, Clock, DollarSign, CreditCard, FileText, Banknote } from 'lucide-react';
import { toast } from 'react-toastify';
import useBooking from '../../hooks/useBooking';
import bookingService from '../../services/bookingService';
import inspectionService from '../../services/inspectionService';
import uploadService from '../../services/uploadService';
import useDebounce from '../../hooks/useDebounce';
import AdminLayout from '../../components/Admin/AdminLayout';
import '../../styles/pages/ManageBookings.css';

const STATUS_CONFIG = {
  PENDING_APPROVED: { bg: 'warning', text: 'Chờ duyệt' },
  WAITING_PAYMENT: { bg: 'warning', text: 'Chờ thanh toán' },
  APPROVED: { bg: 'info', text: 'Sẵn sàng giao' },
  ACTIVE: { bg: 'primary', text: 'Đang thuê' },
  COMPLETE: { bg: 'success', text: 'Hoàn thành' },
  REJECTED: { bg: 'danger', text: 'Từ chối' },
  WAITING_REFUND: { bg: 'info', text: 'Chờ hoàn cọc' },
  CANCELLED: { bg: 'secondary', text: 'Đã hủy' },
};

const INSPECT_INITIAL = {
  type: 'pickup',
  condition: 'Excellent',
  surcharge: 0,
  notes: '',
  isPaid: false,
  imageUrl: [], 
};

export default function ManageBookings() {
  const safeRender = (val) => {
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return val;
  };

  const { bookings, loading, pagination, fetchBookings, confirmBooking, rejectBooking } = useBooking();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  
  const debouncedSearchTerm = useDebounce(searchText, 500);
  const debouncedStatusFilter = useDebounce(statusFilter, 300);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [showInspect, setShowInspect] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [inspectForm, setInspectForm] = useState(INSPECT_INITIAL);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  const handleUploadImage = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImgUploading(true);
    try {
      const res = await uploadService.uploadImages(files, 'inspections');
      if (res.success) {
        const newUrls = res.data.urls || [res.data.url];
        setInspectForm(prev => ({ 
           ...prev, 
           imageUrl: [...prev.imageUrl, ...newUrls] 
        }));
        toast.success(`Tải thành công ${newUrls.length} ảnh!`);
      }
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên.');
    } finally {
      setImgUploading(false);
    }
  };
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  
  const [showReject, setShowReject] = useState(false);
  const [bookingToReject, setBookingToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadBookings = useCallback(() => {
    fetchBookings({ 
      page, 
      limit: 10, 
      status: debouncedStatusFilter || undefined, 
      search: debouncedSearchTerm || undefined,
      startDate: filterStartDate || undefined,
      endDate: filterEndDate || undefined
    });
  }, [page, debouncedStatusFilter, debouncedSearchTerm, filterStartDate, filterEndDate, fetchBookings]);

  // Handle viewing details - Fetch from backend
  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      setShowDetail(true);
      const res = await bookingService.getBookingById(id);
      if (res.success) {
        setDetailBooking(res.data);
      }
    } catch (err) {
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  // Trigger reload when debounced terms or page change
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  
  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, debouncedStatusFilter, filterStartDate, filterEndDate]);

  const handleConfirm = async () => {
    try {
      const res = await confirmBooking(bookingToConfirm._id);
      if (res.success) { 
        toast.success('Xác nhận đơn thành công!'); 
        setShowConfirm(false);
        loadBookings(); 
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleReject = async () => {
    try {
      setRejectLoading(true);
      const res = await rejectBooking(bookingToReject._id, rejectReason);
      if (res.success) { 
        toast.success('Đã từ chối đơn.'); 
        setShowReject(false);
        setRejectReason('');
        loadBookings(); 
      }
    } catch (err) { 
        toast.error(err.message); 
    } finally {
        setRejectLoading(false);
    }
  };

  const openInspection = (booking, type = 'pickup') => {
    setSelectedBooking(booking);
    setInspectForm({ 
      ...INSPECT_INITIAL, 
      type, 
      imageUrl: [], // Đảm bảo mảng rỗng khi mở mới
      isPaid: booking.paymentStatus === 'paid' ? true : false 
    });
    setShowInspect(true);
  };

  const handleSubmitInspection = async () => {
    if (inspectForm.type === 'pickup' && 
        selectedBooking?.paymentMethod === 'cod' && 
        selectedBooking?.paymentStatus !== 'paid' && 
        !inspectForm.isPaid) {
      toast.warning('Vui lòng xác nhận đã thu đủ tiền trước khi bàn giao!');
      return;
    }

    setInspectLoading(true);
    try {
      const res = await inspectionService.createInspection(selectedBooking._id, {
        type: inspectForm.type,
        condition: inspectForm.condition,
        surcharge: Number(inspectForm.surcharge),
        notes: inspectForm.notes,
        isPaid: inspectForm.isPaid,
        imageUrl: inspectForm.imageUrl, 
      });

      if (res.success) {
        toast.success(`📦 Ghi nhận ${inspectForm.type === 'pickup' ? 'giao' : 'trả'} hàng thành công!`);
        setShowInspect(false);
        loadBookings();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo inspection.');
    } finally {
      setInspectLoading(false);
    }
  };

  const surchargeAmt = Number(inspectForm.surcharge);

  return (
    <AdminLayout>
      <div className="manage-bookings-page">
        <div className="dashboard-header mb-4">
          <h3 className="fw-bold mb-1">🛒 Quản lý Đơn Thuê</h3>
          <p className="text-muted small mb-0">Theo dõi, xác nhận và quản lý trạng thái các đơn đặt đồ chơi</p>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <Card.Header className="bg-white py-3 border-0">
            <Row className="g-3 align-items-center">
              <Col md={3}>
                <InputGroup className="bg-light border-0 px-2 rounded-pill">
                  <InputGroup.Text className="bg-transparent border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
                  <Form.Control
                    className="bg-transparent border-0 shadow-none py-2"
                    placeholder="Tìm tên, email..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  className="rounded-pill px-3 border-light small text-muted py-2"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.text}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <InputGroup className="bg-light rounded-pill px-2 py-1 border-0 overflow-hidden d-flex align-items-center">
                  <Form.Control
                    type="date"
                    className="bg-transparent border-0 shadow-none small text-muted px-2"
                    value={filterStartDate}
                    onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
                    title="Từ ngày nhận"
                  />
                  <span className="text-muted px-1 opacity-50">→</span>
                  <Form.Control
                    type="date"
                    className="bg-transparent border-0 shadow-none small text-muted px-2"
                    value={filterEndDate}
                    onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
                    title="Đến ngày nhận"
                  />
                </InputGroup>
              </Col>
              <Col md={2} className="text-end text-muted small">
                Tổng: <strong>{pagination.total ?? 0}</strong> đơn
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
            ) : (
              <div className="bk-table-container">
                <Table hover className="bk-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="px-4">Khách hàng</th>
                      <th>Đồ chơi</th>
                      <th className="text-center">Thời gian thuê</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th className="px-4 text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const isPending = b.status === 'PENDING_APPROVED';
                      const sc = STATUS_CONFIG[b.status] || { bg: 'secondary', text: b.status };
                      return (
                        <tr key={b._id} className={isPending ? 'bg-light' : ''}>
                          <td className="px-4">
                            <div className="fw-bold text-dark">{b.renterId?.name || '—'}</div>
                            <div className="text-muted small">{b.renterId?.email}</div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img src={b.toyId?.thumbnail} alt="" style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 8 }} />
                              <div className="fw-semibold text-truncate text-dark" style={{ maxWidth: 200 }}>{b.toyId?.title}</div>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="fw-bold fs-6 text-dark">{new Date(b.startDate).toLocaleDateString('vi-VN')}</div>
                            <div className="text-muted small">đến {new Date(b.endDate).toLocaleDateString('vi-VN')}</div>
                          </td>
                          <td className="fw-bold text-success fs-6">{b.totalAmount?.toLocaleString('vi-VN')}đ</td>
                          <td>
                            <Badge bg={sc.bg} className="bk-status-badge shadow-sm">{sc.text}</Badge>
                          </td>
                          <td className="px-4 text-end">
                            <div className="d-flex gap-2 justify-content-end align-items-center flex-wrap">
                              {b.status === 'PENDING_APPROVED' && (
                                <>
                                  <Button size="sm" variant="success" className="px-3 rounded-pill fw-medium shadow-sm" onClick={() => { setBookingToConfirm(b); setShowConfirm(true); }}>
                                    Duyệt
                                  </Button>
                                  <Button size="sm" variant="outline-danger" className="px-3 rounded-pill fw-medium bg-white" onClick={() => { setBookingToReject(b); setShowReject(true); }}>
                                    Từ chối
                                  </Button>
                                </>
                              )}

                              {b.status === 'APPROVED' && (
                                <Button size="sm" variant="info" className="px-3 rounded-pill fw-medium shadow-sm text-white" onClick={() => openInspection(b, 'pickup')}>
                                  Giao đồ
                                </Button>
                              )}
                              
                              {b.status === 'ACTIVE' && (
                                <Button size="sm" variant="primary" className="px-3 rounded-pill fw-medium shadow-sm" onClick={() => openInspection(b, 'return')}>
                                  Thu hồi đồ
                                </Button>
                              )}

                              <Button
                                variant="light"
                                className="rounded-circle d-flex align-items-center justify-content-center border shadow-sm p-0"
                                style={{ width: '32px', height: '32px', flexShrink: 0 }}
                                onClick={() => { setDetailBooking(b); setShowDetail(true); }}
                                title="Xem chi tiết"
                              >
                                <Eye size={16} className="text-secondary" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Pagination */}
        {(pagination.pages || 0) > 1 && (
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
              {[...Array(pagination.pages)].map((_, i) => (
                <Pagination.Item key={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} />
            </Pagination>
          </div>
        )}

        <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered className="premium-modal">
          <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
            <Modal.Title className="fw-bold fs-4 d-flex align-items-center gap-2">
              <span className="bg-success bg-opacity-10 text-success p-2 rounded-circle d-flex"><FileText size={22} /></span>
              Chi tiết Đơn hàng
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 px-5">
            {detailLoading ? (
               <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
            ) : detailBooking ? (
              <div className="d-flex flex-column gap-4">
                <Row className="g-4">
                  <Col md={6}>
                    <div className="p-4 rounded-4 bg-white border shadow-sm h-100 position-relative overflow-hidden">
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-success bg-opacity-10" style={{ opacity: 0.3 }}></div>
                      <label className="text-success small text-uppercase fw-bold mb-3 d-flex align-items-center gap-2 position-relative">
                        <User size={16} /> Thông tin Khách hàng
                      </label>
                      <div className="position-relative">
                        <div className="fw-bold fs-5 text-dark mb-1">{detailBooking.renterId?.name}</div>
                        <div className="text-muted small mb-1">{detailBooking.renterId?.email}</div>
                        <div className="text-muted fw-medium font-monospace">{detailBooking.renterId?.phoneNumber}</div>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-4 rounded-4 bg-white border shadow-sm h-100">
                      <label className="text-primary small text-uppercase fw-bold mb-3 d-flex align-items-center gap-2">
                        <Package size={16} /> Sản phẩm thuê
                      </label>
                      <div className="d-flex gap-3 align-items-center">
                        <img src={detailBooking.toyId?.thumbnail} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                        <div>
                          <div className="fw-bold fs-6 text-dark mb-2">{detailBooking.toyId?.title}</div>
                          <span className="badge bg-light text-dark border px-3 py-2 fw-medium rounded-pill">{detailBooking.toyId?.category}</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div>
                  <label className="text-muted small text-uppercase fw-bold mb-3 d-flex align-items-center gap-2">
                    <Calendar size={16} /> Thông số giao dịch
                  </label>
                  <Row className="g-3">
                    <Col xs={6} md={3}>
                       <div className="p-3 bg-light rounded-4 text-center border-0 h-100">
                         <Calendar size={18} className="text-muted mb-2 opacity-50" />
                         <small className="text-muted d-block mb-1">Ngày nhận</small>
                         <span className="fw-bold text-dark fs-6">{new Date(detailBooking.startDate).toLocaleDateString('vi-VN')}</span>
                       </div>
                    </Col>
                    <Col xs={6} md={3}>
                       <div className="p-3 bg-light rounded-4 text-center border-0 h-100">
                         <Calendar size={18} className="text-muted mb-2 opacity-50" />
                         <small className="text-muted d-block mb-1">Ngày trả</small>
                         <span className="fw-bold text-dark fs-6">{new Date(detailBooking.endDate).toLocaleDateString('vi-VN')}</span>
                       </div>
                    </Col>
                    <Col xs={6} md={3}>
                       <div className="p-3 bg-light rounded-4 text-center border-0 h-100">
                         <Clock size={18} className="text-muted mb-2 opacity-50" />
                         <small className="text-muted d-block mb-1">Thời lượng</small>
                         <span className="fw-bold text-dark fs-6">
                           {Math.ceil((new Date(detailBooking.endDate) - new Date(detailBooking.startDate)) / (1000 * 60 * 60))} giờ
                         </span>
                       </div>
                    </Col>
                    <Col xs={6} md={3}>
                       <div className="p-3 bg-light rounded-4 text-center border-0 h-100">
                         <DollarSign size={18} className="text-muted mb-2 opacity-50" />
                         <small className="text-muted d-block mb-1">Giá thuê</small>
                         <span className="fw-bold text-success fs-6">{detailBooking.totalAmount?.toLocaleString()}đ</span>
                       </div>
                    </Col>
                    <Col xs={6} md={4}>
                       <div className="p-3 bg-light rounded-4 text-center border-0 h-100">
                         <CreditCard size={18} className="text-muted mb-2 opacity-50" />
                         <small className="text-muted d-block mb-1">Tiền cọc</small>
                         <span className="fw-bold text-primary fs-6">{detailBooking.depositAmount?.toLocaleString()}đ</span>
                       </div>
                    </Col>
                    <Col xs={6} md={4}>
                       <div className="p-3 bg-light rounded-4 text-center border-0 h-100">
                         <Banknote size={18} className="text-muted mb-2 opacity-50" />
                         <small className="text-muted d-block mb-1">Thanh toán</small>
                         <span className="fw-bold text-dark fs-6 text-uppercase">
                           {detailBooking.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt'}
                         </span>
                       </div>
                    </Col>
                    <Col xs={12} md={4}>
                       <div className={`p-3 rounded-4 text-center border-0 h-100 ${detailBooking.paymentStatus === 'paid' ? 'bg-success bg-opacity-10' : 'bg-warning bg-opacity-10'}`}>
                         <CheckCircle size={18} className={`mb-2 opacity-75 ${detailBooking.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`} />
                         <small className="text-muted d-block mb-1">Trạng thái tiền</small>
                         <span className={`fw-bold fs-6 text-uppercase ${detailBooking.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                           {detailBooking.paymentStatus === 'paid' ? 'Đã thanh toán' : 
                            detailBooking.paymentStatus === 'failed' ? 'Thất bại' : 'Chưa thu'}
                         </span>
                       </div>
                    </Col>
                  </Row>
                </div>

                {detailBooking.message && (
                <div>
                  <label className="text-muted small text-uppercase fw-bold mb-2 d-flex align-items-center gap-2"><FileText size={16}/> Ghi chú từ khách hàng</label>
                  <div className="p-3 bg-light rounded-4 text-dark fst-italic small border-0">{detailBooking.message}</div>
                </div>
                )}

                {detailBooking.employeeId && (
                <div>
                  <div className="p-3 bg-light rounded-4 border-0 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <User size={16} className="text-secondary" />
                      <span className="small text-muted">Nhân viên phụ trách:</span>
                      <strong className="small text-dark">{detailBooking.employeeId.name}</strong>
                    </div>
                    {detailBooking.status === 'REJECTED' && (
                      <div className="text-danger small fw-bold bg-danger bg-opacity-10 px-3 py-1 rounded-pill">Đã từ chối đơn</div>
                    )}
                  </div>
                </div>
                )}

                {detailBooking.status === 'REJECTED' && detailBooking.rejectionReason && (
                <div>
                  <label className="text-danger small text-uppercase fw-bold mb-2 d-block">Lý do từ chối</label>
                  <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-4 border-0 small fw-medium">
                    {detailBooking.rejectionReason}
                  </div>
                </div>
                )}
              </div>
            ) : null}
          </Modal.Body>
        </Modal>

        {/* Return Inspection Modal */}
        <Modal show={showInspect} onHide={() => setShowInspect(false)} size="lg" centered backdrop="static">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className={`fw-bold ${inspectForm.type === 'pickup' ? 'text-success' : 'text-primary'}`}>
              {inspectForm.type === 'pickup' ? <><Package size={24} /> Giao đồ cho khách</> : <><ClipboardCheck size={24} /> Thu hồi đồ từ khách</>}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {selectedBooking && (
              <>
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-4 border">
                  <img src={selectedBooking.toyId?.thumbnail} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                  <div className="small">
                    <div className="fw-bold fs-6">{selectedBooking.toyId?.title}</div>
                    <div className="text-muted">Khách hàng: <strong className="text-dark">{selectedBooking.renterId?.name}</strong></div>
                  </div>
                </div>

                <Form>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Tình trạng đồ chơi</Form.Label>
                      <Form.Select 
                        className="rounded-3 shadow-none border-light py-2"
                        value={inspectForm.condition}
                        onChange={(e) => setInspectForm((p) => ({ ...p, condition: e.target.value }))}
                      >
                        {['New', 'Excellent', 'Good', 'Fair', 'Broken'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Ảnh thực tế bàn giao/thu hồi</Form.Label>
                      <div className="d-flex align-items-center gap-2">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100 border-dashed py-2 d-flex align-items-center justify-content-center gap-2"
                          onClick={() => document.getElementById('inspect-image-upload').click()}
                          disabled={imgUploading}
                        >
                          {imgUploading ? <Spinner size="sm" /> : <Camera size={18} />}
                           {Array.isArray(inspectForm.imageUrl) && inspectForm.imageUrl.length > 0 ? `Đã chọn ${inspectForm.imageUrl.length} ảnh` : 'Chọn ảnh thực tế'}
                        </Button>
                        <input 
                          id="inspect-image-upload"
                          type="file" 
                          multiple
                          hidden 
                          accept="image/*"
                          onChange={handleUploadImage}
                        />
                      </div>
                    </Col>

                    {inspectForm.type === 'pickup' && (
                      <Col md={12}>
                        {selectedBooking.paymentMethod === 'cod' && selectedBooking.paymentStatus !== 'paid' ? (
                          <div className="p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="fw-bold text-dark">💵 Khoản cần thu (COD)</div>
                              <Form.Check 
                                type="switch"
                                id="cash-collect-switch"
                                label="Đã thu tiền"
                                checked={inspectForm.isPaid}
                                onChange={(e) => setInspectForm((p) => ({ ...p, isPaid: e.target.checked }))}
                                className="fw-bold text-success"
                              />
                            </div>
                            <div className="ps-3 border-start border-2 border-warning border-opacity-25">
                              <div className="d-flex justify-content-between small mb-1">
                                <span>Phí thuê đồ chơi:</span>
                                <strong>{selectedBooking.totalAmount?.toLocaleString()}đ</strong>
                              </div>
                              <div className="d-flex justify-content-between small mb-1">
                                <span>Tiền đặt cọc:</span>
                                <strong>{selectedBooking.depositAmount?.toLocaleString()}đ</strong>
                              </div>
                              <hr className="my-2" />
                              <div className="d-flex justify-content-between fw-bold text-danger">
                                <span>TỔNG CỘNG:</span>
                                <span>{(selectedBooking.totalAmount + selectedBooking.depositAmount).toLocaleString()}đ</span>
                              </div>
                            </div>
                            <small className="text-muted d-block mt-2 italic">* Vui lòng kiểm tra và thu đủ tiền mặt trước khi giao đồ.</small>
                          </div>
                        ) : (
                          <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-4 d-flex align-items-center gap-2">
                             <CheckCircle size={18} className="text-success" />
                             <span className="fw-bold text-success">Đơn hàng đã được thanh toán qua {selectedBooking.paymentMethod === 'vnpay' ? 'VNPay' : 'Hệ thống'}</span>
                          </div>
                        )}
                      </Col>
                    )}

                    {inspectForm.type === 'return' && (
                      <Col md={6}>
                        <Form.Label className="small fw-bold">Phụ phí phát sinh (nếu có - đ)</Form.Label>
                        <Form.Control
                          className="rounded-3 shadow-none border-light py-2 text-danger fw-bold"
                          type="number"
                          min={0}
                          value={inspectForm.surcharge}
                          onChange={(e) => setInspectForm((p) => ({ ...p, surcharge: e.target.value }))}
                        />
                      </Col>
                    )}

                    <Col md={inspectForm.type === 'pickup' ? 12 : 6}>
                       <Form.Label className="small fw-bold">Ghi chú chi tiết</Form.Label>
                       <Form.Control
                        className="rounded-3 shadow-none border-light"
                        as="textarea"
                        rows={inspectForm.type === 'pickup' ? 2 : 1}
                        value={inspectForm.notes}
                        onChange={(e) => setInspectForm((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="Mô tả hỏng hóc hoặc tình trạng bàn giao..."
                      />
                    </Col>
                  </Row>
                  
                  {Array.isArray(inspectForm.imageUrl) && inspectForm.imageUrl.length > 0 && (
                    <div className="mt-3 p-3 bg-light rounded-4 border border-dashed text-center">
                       <div className="d-flex flex-wrap gap-3 justify-content-center">
                          {inspectForm.imageUrl.map((url, idx) => (
                            <div key={idx} className="position-relative shadow-sm hover-scale transition-all" style={{ width: 110, height: 110 }}>
                               <img src={url} alt={`Inspection ${idx}`} className="w-100 h-100 rounded-4 border" style={{ objectFit: 'cover' }} />
                               <button 
                                 type="button"
                                 className="btn btn-danger btn-sm p-0 rounded-circle position-absolute d-flex align-items-center justify-content-center" 
                                 style={{ top: -8, right: -8, width: 22, height: 22, border: '2px solid white' }}
                                 onClick={() => setInspectForm(p => ({ ...p, imageUrl: p.imageUrl.filter((_, i) => i !== idx) }))}
                               >
                                 <Plus size={14} style={{ transform: 'rotate(45deg)' }} />
                               </button>
                            </div>
                          ))}
                          <div 
                             className="border border-dashed d-flex align-items-center justify-content-center bg-white rounded-4 cursor-pointer hover-bg-light transition-all"
                             style={{ width: 110, height: 110, border: '2px dashed #ccc' }}
                             onClick={() => document.getElementById('inspect-image-upload').click()}
                          >
                             <div className="text-center text-muted">
                                <Plus size={24} className="mb-1" />
                                <div className="fw-bold x-small">Thêm ảnh</div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </Form>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pb-4">
            <Button variant="light" onClick={() => setShowInspect(false)}>Đóng</Button>
            <Button 
              variant={inspectForm.type === 'pickup' ? 'success' : 'primary'} 
              onClick={handleSubmitInspection} 
              disabled={inspectLoading} 
              className="px-5 shadow-sm rounded-pill fw-bold"
            >
              {inspectLoading ? <Spinner size="sm" className="me-1" /> : null}
              {inspectForm.type === 'pickup' ? 'Xác nhận Bàn giao' : 'Ghi nhận Thu hồi'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Confirm Approval Modal */}
        <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered backdrop="static">
          <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="fw-bold">Xác nhận duyệt đơn</Modal.Title></Modal.Header>
          <Modal.Body className="py-4">
            Bạn có chắc chắn muốn duyệt đơn thuê đồ chơi <strong>{bookingToConfirm?.toyId?.title}</strong> của khách <strong>{bookingToConfirm?.renterId?.name}</strong>?
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowConfirm(false)}>Hủy</Button>
            <Button variant="success" className="px-4" onClick={handleConfirm}>Đồng ý Duyệt</Button>
          </Modal.Footer>
        </Modal>

        {/* Reject Modal */}
        <Modal show={showReject} onHide={() => setShowReject(false)} centered backdrop="static">
          <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="fw-bold text-danger">Từ chối đơn thuê</Modal.Title></Modal.Header>
          <Modal.Body className="py-3">
            <p className="small text-muted mb-3">Vui lòng nhập lý do từ chối để thông báo cho khách hàng.</p>
            <Form.Group>
              <Form.Label className="small fw-bold">Lý do từ chối</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Ví dụ: Đồ chơi hiện đang bảo trì, thời gian thuê không phù hợp..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="rounded-3"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowReject(false)}>Đóng</Button>
            <Button 
              variant="danger" 
              className="px-4" 
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectLoading}
            >
              {rejectLoading ? <Spinner size="sm" className="me-1" /> : null}
              Xác nhận Từ chối
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
}
