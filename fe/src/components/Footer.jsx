import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ToyBrick, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import '../styles/components/Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`Thank you for subscribing with: ${email}`);
      setEmail('');
    }
  };

  return (
    <footer className="ftr-container">
      {/* Newsletter Strip */}
      <div className="ftr-newsletter-strip">
        <Container>
          <Row className="align-items-center py-3 g-3">
            <Col md={6}>
              <h5 className="ftr-newsletter-title">Subscribe to our newsletter</h5>
              <p className="ftr-newsletter-subtitle text-muted-white">Get updates on new toy additions, offers, and tips.</p>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end">
              <Form onSubmit={handleSubscribe} className="ftr-subscribe-box">
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  className="ftr-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="ftr-subscribe-btn">
                  Subscribe
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Footer Links */}
      <div className="ftr-main">
        <Container>
          <Row className="g-4">
            {/* Brand column */}
            <Col lg={4} md={6}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="ftr-brand-logo">
                  <ToyBrick size={18} className="text-white" />
                </div>
                <span className="ftr-brand-name">ToyRental</span>
              </div>
              <p className="ftr-brand-desc mb-4">
                We provide the premium toy sharing platform where parents can rent high-quality toys for their children, promoting educational play while saving money and space.
              </p>
              <div className="d-flex gap-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="ftr-social-link">
                  <Facebook size={16} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="ftr-social-link">
                  <Twitter size={16} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="ftr-social-link">
                  <Instagram size={16} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="ftr-social-link">
                  <Youtube size={16} />
                </a>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} xs={6}>
              <h6 className="ftr-col-title">Quick Links</h6>
              <ul className="ftr-list">
                <li><Link to="/toys" className="ftr-link">Browse Toys</Link></li>
                <li><Link to="/bookings" className="ftr-link">My Rentals</Link></li>
                <li><Link to="/profile" className="ftr-link">Account Settings</Link></li>
                <li><Link to="/login" className="ftr-link">Log In</Link></li>
              </ul>
            </Col>

            {/* Useful Links */}
            <Col lg={2} md={6} xs={6}>
              <h6 className="ftr-col-title">Resources</h6>
              <ul className="ftr-list">
                <li><a href="#how-it-works" className="ftr-link">How it works</a></li>
                <li><a href="#pricing" className="ftr-link">Pricing plans</a></li>
                <li><a href="#faq" className="ftr-link">FAQs</a></li>
                <li><a href="#support" className="ftr-link">Support center</a></li>
              </ul>
            </Col>

            {/* Contact Details */}
            <Col lg={4} md={6}>
              <h6 className="ftr-col-title">Contact Us</h6>
              <ul className="ftr-list">
                <li className="ftr-contact-item">
                  <MapPin size={16} className="ftr-contact-icon" />
                  <span>Hoa Lac High Tech Park, Thach That District, Hanoi, Vietnam</span>
                </li>
                <li className="ftr-contact-item">
                  <Phone size={16} className="ftr-contact-icon" />
                  <span>+84 (24) 7300 1866</span>
                </li>
                <li className="ftr-contact-item">
                  <Mail size={16} className="ftr-contact-icon" />
                  <span>support@toyrental.com</span>
                </li>
              </ul>
              <div className="ftr-hours">
                Open Hours: Mon - Sat: 8:00 AM - 6:00 PM
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="ftr-bottom-bar">
        <Container>
          <Row className="g-2">
            <Col sm={6} className="text-center text-sm-start">
              <span className="ftr-copy">&copy; {new Date().getFullYear()} ToyRental System. All rights reserved.</span>
            </Col>
            <Col sm={6} className="d-flex justify-content-center justify-content-sm-end">
              <div className="ftr-policy-links">
                <a href="#privacy" className="ftr-policy-link">Privacy Policy</a>
                <a href="#terms" className="ftr-policy-link">Terms of Service</a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}
