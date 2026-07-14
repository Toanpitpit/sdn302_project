import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toyService from '../services/toyService';
import '../styles/components/CategorySection.css';

const DEFAULT_CATEGORIES = [
  { name: 'LEGO', count: 12, color: 'linear-gradient(135deg, #ff6b6b, #ee5253)' },
  { name: 'Board Games', count: 8, color: 'linear-gradient(135deg, #4da9ff, #2680eb)' },
  { name: 'Educational', count: 15, color: 'linear-gradient(135deg, #34eb9e, #10bd74)' },
  { name: 'Action Figures', count: 9, color: 'linear-gradient(135deg, #ffd32a, #ff9f1a)' },
  { name: 'Puzzles', count: 14, color: 'linear-gradient(135deg, #a55eea, #8854d0)' },
  { name: 'Dolls & Playsets', count: 10, color: 'linear-gradient(135deg, #ff9ff3, #f368e0)' }
];

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await toyService.getAllCategories();
        if (res.success && res.data && res.data.length > 0) {
          const formatted = res.data.map((cat, idx) => {
            const defaultMatch = DEFAULT_CATEGORIES.find(
              (d) => d.name.toLowerCase() === cat.toLowerCase()
            );
            return {
              name: cat,
              count: defaultMatch ? defaultMatch.count : Math.floor(Math.random() * 8) + 4,
              color: defaultMatch ? defaultMatch.color : getRandomColor(idx)
            };
          });
          // Limit to maximum 6 categories to fit on the screen
          setCategories(formatted.slice(0, 6));
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const getRandomColor = (index) => {
    const palette = ['#ff6b6b', '#4dadf7', '#51cf66', '#fcc419', '#ff922b', '#cc5de8', '#845ef7', '#339af0', '#20c997'];
    return palette[index % palette.length];
  };

  const handleCategoryClick = (name) => {
    navigate(`/toys?category=${encodeURIComponent(name)}`);
  };

  return (
    <section className="cat-section">
      <Container>
        <div className="cat-header">
          <h2 className="cat-title">Browse by Category</h2>
          <p className="cat-subtitle">Explore our wide selection of toys suited for all interests and ages</p>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <Row className="g-4 justify-content-center">
            {categories.map((cat, idx) => (
              <Col lg={2} md={4} sm={6} xs={6} key={idx}>
                <div className="cat-card" onClick={() => handleCategoryClick(cat.name)}>
                  <div className="cat-icon-container" style={{ background: cat.color }}>
                    <span className="cat-initial">{cat.name.charAt(0)}</span>
                  </div>
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-count">{cat.count} items</div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}
