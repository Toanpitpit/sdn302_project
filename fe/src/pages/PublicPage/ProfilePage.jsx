import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, Camera, Check, Shield } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';
import '../../styles/pages/profile.css';

export default function ProfilePage() {
  const { userProfile, updateProfileWrapper, updateAvatarWrapper, changePasswordWrapper } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Avatar upload loading
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!userProfile) {
      toast.info('Please login to view your profile.');
      navigate('/login');
      return;
    }
    setFullName(userProfile.fullName || '');
    setPhoneNumber(userProfile.phoneNumber || '');
  }, [userProfile, navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await updateProfileWrapper({ fullName, phoneNumber });
      if (res.success) {
        toast.success(res.message || 'Profile updated successfully!');
      } else {
        toast.error(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      toast.error('Server error updating profile details.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePasswordWrapper({ currentPassword, newPassword });
      if (res.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Failed to change password.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server error changing password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const res = await updateAvatarWrapper(formData);
      if (res.success) {
        toast.success('Avatar uploaded successfully!');
      } else {
        toast.error(res.message || 'Failed to upload avatar.');
      }
    } catch (err) {
      toast.error('Server error uploading avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="toy-detail-page bg-light" style={{ minHeight: '100vh' }}>
      <Header />

      <Container className="py-5 profile-container">
        <Row className="g-4">
          {/* Avatar and Card left */}
          <Col md={4} className="text-center">
            <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="avatar-wrapper mb-3" onClick={() => avatarInputRef.current.click()}>
                  {isUploadingAvatar ? (
                    <div className="position-absolute w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center rounded-circle z-3">
                      <Spinner animation="border" variant="light" size="sm" />
                    </div>
                  ) : (
                    <div className="avatar-overlay text-white">
                      <Camera size={24} />
                    </div>
                  )}
                  <img
                    src={userProfile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&h=140&fit=crop&q=80'}
                    className="profile-avatar img-fluid"
                    alt={userProfile.fullName || 'User'}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&h=140&fit=crop&q=80';
                    }}
                  />
                  <input
                    type="file"
                    ref={avatarInputRef}
                    className="d-none"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                
                <h4 className="fw-bold mb-1">{userProfile.fullName || 'User Profile'}</h4>
                <p className="text-muted small mb-3">{userProfile.email}</p>
                
                <Badge bg={userProfile.role === 'ADMIN' ? 'danger' : userProfile.role === 'EMPLOYEE' ? 'warning' : 'success'} className="px-3 py-2 rounded-pill">
                  {userProfile.role || 'CUSTOMER'}
                </Badge>
              </Card.Body>
            </Card>
          </Col>

          {/* Form Tabs right */}
          <Col md={8}>
            <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
              <Card.Body>
                <Tabs defaultActiveKey="info" className="profile-tabs border-0 mb-4">
                  <Tab eventKey="info" title={<span className="d-flex align-items-center gap-2"><User size={16} /> Profile Info</span>}>
                    <Form onSubmit={handleProfileSubmit} className="mt-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Email Address (Locked)</Form.Label>
                        <InputGroup className="bg-light rounded-3">
                          <InputGroup.Text className="bg-transparent border-0 pe-1 text-muted">
                            <Mail size={16} />
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            className="bg-transparent border-0 text-muted shadow-none"
                            value={userProfile.email}
                            disabled
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          className="rounded-3 shadow-none border"
                          placeholder="Your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold">Phone Number</Form.Label>
                        <InputGroup className="border rounded-3">
                          <InputGroup.Text className="bg-transparent border-0 pe-1 text-muted">
                            <Phone size={16} />
                          </InputGroup.Text>
                          <Form.Control
                            type="tel"
                            required
                            className="bg-transparent border-0 shadow-none"
                            placeholder="Your contact number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </InputGroup>
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="success"
                        className="px-4 py-2 rounded-pill fw-bold"
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Updating...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </Form>
                  </Tab>

                  <Tab eventKey="security" title={<span className="d-flex align-items-center gap-2"><Lock size={16} /> Password</span>}>
                    <Form onSubmit={handlePasswordSubmit} className="mt-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          required
                          className="rounded-3 shadow-none border"
                          placeholder="Enter your current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">New Password</Form.Label>
                        <Form.Control
                          type="password"
                          required
                          className="rounded-3 shadow-none border"
                          placeholder="Enter a new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold">Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          required
                          className="rounded-3 shadow-none border"
                          placeholder="Confirm your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="success"
                        className="px-4 py-2 rounded-pill fw-bold"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Changing...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </Form>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}
