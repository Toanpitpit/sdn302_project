import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Dropdown, Form, InputGroup, Button } from 'react-bootstrap';
import { Search, LogOut, User, Calendar, Shield, Heart, ToyBrick } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import '../styles/components/Header.css';

export default function Header() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/toys?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/toys');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAdminOrEmployee = userProfile?.role === 'ADMIN' || userProfile?.role === 'EMPLOYEE';

  return (
    <Navbar expand="lg" className="hdr-navbar sticky-top bg-white">
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="hdr-logo-box">
          <div className="hdr-logo-icon">
            <ToyBrick size={22} className="text-white" />
          </div>
          <div>
            <div className="hdr-logo-name">ToyRental</div>
            <div className="hdr-logo-tag">Premium Toy Sharing</div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" className="border-0 shadow-none" />

        <Navbar.Collapse id="navbar-nav">
          {/* Search Bar */}
          <Form onSubmit={handleSearch} className="hdr-search-container d-flex my-2 my-lg-0 mx-lg-auto">
            <InputGroup className="hdr-search-group">
              <Form.Control
                type="search"
                placeholder="Search toys, brands, categories..."
                className="hdr-search-input border-0"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="hdr-search-btn">
                <Search size={16} />
              </Button>
            </InputGroup>
          </Form>

          {/* Navigation Links */}
          <Nav className="me-auto align-items-center mb-2 mb-lg-0">
            <Nav.Link as={Link} to="/toys" className="hdr-nav-link">
              Browse Toys
            </Nav.Link>
            <Nav.Link as={Link} to="/bookings" className="hdr-nav-link">
              Rentals
            </Nav.Link>
          </Nav>

          {/* Auth State Button/Dropdown */}
          <Nav className="align-items-center gap-2">
            {userProfile ? (
              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="hdr-user-btn cursor-pointer" role="button">
                  <img
                    src={userProfile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'}
                    alt={userProfile.fullName || 'User'}
                    className="hdr-avatar"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80';
                    }}
                  />
                  <span className="hdr-user-name d-none d-sm-inline">
                    {userProfile.fullName || 'User Profile'}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="hdr-dropdown-menu border-0 shadow mt-2">
                  <Dropdown.Item as={Link} to="/profile" className="hdr-dropdown-item">
                    <User size={16} className="text-muted" />
                    <span>My Profile</span>
                  </Dropdown.Item>

                  <Dropdown.Item as={Link} to="/bookings" className="hdr-dropdown-item">
                    <Calendar size={16} className="text-muted" />
                    <span>My Bookings</span>
                  </Dropdown.Item>

                  {isAdminOrEmployee && (
                    <Dropdown.Item as={Link} to="/admin" className="hdr-dropdown-item">
                      <Shield size={16} className="text-muted" />
                      <span>Admin Panel</span>
                    </Dropdown.Item>
                  )}

                  <Dropdown.Divider />

                  <Dropdown.Item onClick={handleLogout} className="hdr-dropdown-item text-danger">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex align-items-center gap-2 w-100 justify-content-end">
                <Button as={Link} to="/login" variant="light" className="hdr-btn-login">
                  Login
                </Button>
                <Button as={Link} to="/register" className="hdr-btn-register">
                  Sign Up
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
