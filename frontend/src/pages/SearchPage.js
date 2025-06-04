import React, { useState, useEffect, useCallback } from 'react';
import RestaurantDetailPage from './RestaurantDetailPage';
import { searchRestaurants, fetchCategories } from '../services/restaurantService';
import { searchFoods, fetchFoodCategories } from '../services/foodService';

const SearchBar = ({ query, setQuery, category, setCategory, categories, onSearch, searchType, setSearchType }) => (
  <div style={{ 
    background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)', 
    padding: '2rem 0 3rem 0',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
    }} />
    
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '0 1rem',
      position: 'relative',
      zIndex: 1
    }}>
      <h1 style={{ 
        color: '#fff', 
        textAlign: 'center', 
        margin: '0 0 2rem 0', 
        fontSize: '2.5rem',
        fontWeight: '700',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        Tìm Kiếm {searchType === 'restaurants' ? 'Nhà Hàng' : 'Món Ăn'}
      </h1>
      
      {/* Search Type Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setSearchType('restaurants')}
          style={{
            background: searchType === 'restaurants' ? '#fff' : 'rgba(255,255,255,0.2)',
            color: searchType === 'restaurants' ? '#ff7043' : '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.8rem 2rem',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🏪 Nhà Hàng
        </button>
        <button
          onClick={() => setSearchType('foods')}
          style={{
            background: searchType === 'foods' ? '#fff' : 'rgba(255,255,255,0.2)',
            color: searchType === 'foods' ? '#ff7043' : '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.8rem 2rem',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🍽️ Món Ăn
        </button>
      </div>
      
      <div style={{ 
        background: '#fff', 
        borderRadius: '16px', 
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '2', minWidth: '200px' }}>
            <input
              type="text"
              placeholder={`Tìm kiếm ${searchType === 'restaurants' ? 'nhà hàng, địa chỉ...' : 'món ăn, thành phần...'}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff7043'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          
          <div style={{ flex: '1', minWidth: '150px' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                background: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <option value="all">Tất cả loại</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={onSearch}
          style={{
            background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '1rem 3rem',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(255, 112, 67, 0.3)',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(255, 112, 67, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 16px rgba(255, 112, 67, 0.3)';
          }}
        >
          🔍 Tìm Kiếm
        </button>
      </div>
    </div>
  </div>
);

const RestaurantCard = ({ restaurant, onSelect }) => (
  <div 
    onClick={() => onSelect(restaurant.id)}
    style={{
      background: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid #f0f0f0'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    }}
  >
    {restaurant.imageUrl && (
      <div style={{ 
        width: '100%', 
        height: '200px', 
        background: `url(${restaurant.imageUrl}) center/cover`,
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255,255,255,0.9)',
          padding: '0.5rem 0.8rem',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#ff7043'
        }}>
          {restaurant.category}
        </div>
      </div>
    )}
    
    <div style={{ padding: '1.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.3rem',
          fontWeight: '700',
          color: '#333',
          lineHeight: '1.3'
        }}>
          {restaurant.name}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: '#ffeaa7',
          padding: '0.3rem 0.6rem',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ⭐ {restaurant.rating}
        </div>
      </div>
      
      <p style={{
        margin: '0.5rem 0 1rem 0',
        color: '#666',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        {restaurant.description}
      </p>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        fontSize: '14px',
        color: '#888'
      }}>
        <span>📍</span>
        <span>{restaurant.address}</span>
      </div>
      
      {restaurant.foods && restaurant.foods.length > 0 && (
        <div>
          <div style={{
            fontSize: '12px',
            color: '#999',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            MÓN NỔI BẬT:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {restaurant.foods.slice(0, 3).map(food => (
              <span key={food.id} style={{
                background: '#f8f9fa',
                padding: '0.3rem 0.6rem',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#666',
                border: '1px solid #e9ecef'
              }}>
                {food.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #f0f0f0'
      }}>
        <span style={{ fontSize: '12px', color: '#888' }}>
          Click để xem chi tiết
        </span>
        <span style={{ color: '#ff7043', fontSize: '14px' }}>→</span>
      </div>
    </div>
  </div>
);

const FoodCard = ({ food }) => (
  <div style={{
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    border: '1px solid #f0f0f0'
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
  }}>
    {food.imageUrl && (
      <div style={{ 
        width: '100%', 
        height: '200px', 
        background: `url(${food.imageUrl}) center/cover`,
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255,255,255,0.9)',
          padding: '0.5rem 0.8rem',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#ff7043'
        }}>
          {food.category}
        </div>
      </div>
    )}
    
    <div style={{ padding: '1.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.3rem',
          fontWeight: '700',
          color: '#333',
          lineHeight: '1.3'
        }}>
          {food.name}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: '#ffeaa7',
          padding: '0.3rem 0.6rem',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ⭐ {food.rating}
        </div>
      </div>
      
      <p style={{
        margin: '0.5rem 0 1rem 0',
        color: '#666',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        {food.description}
      </p>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: '700',
          color: '#ff7043'
        }}>
          {food.price.toLocaleString()}₫
        </div>
        <div style={{
          fontSize: '12px',
          color: '#999',
          textAlign: 'right'
        }}>
          <div>{food.restaurant.name}</div>
          <div>📍 {food.restaurant.address}</div>
        </div>
      </div>
    </div>
  </div>
);

function SearchPage({ onBack }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [searchType, setSearchType] = useState('restaurants'); // 'restaurants' hoặc 'foods'
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [restaurantCategories, setRestaurantCategories] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(setRestaurantCategories)
      .catch(() => setError('Không lấy được danh sách thể loại nhà hàng'));
      
    fetchFoodCategories()
      .then(setFoodCategories)
      .catch(() => setError('Không lấy được danh sách thể loại món ăn'));
  }, []);

  const handleSearch = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      if (searchType === 'restaurants') {
        const result = await searchRestaurants(query, category, page);
        setRestaurants(result.restaurants);
        setFoods([]);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total
        });
      } else {
        const result = await searchFoods(query, category, page);
        setFoods(result.foods);
        setRestaurants([]);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total
        });
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      setRestaurants([]);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [query, category, searchType]);

  // Reset category when switching search type
  useEffect(() => {
    setCategory('all');
  }, [searchType]);

  if (selectedRestaurantId) {
    return <RestaurantDetailPage 
      restaurantId={selectedRestaurantId} 
      onBack={() => setSelectedRestaurantId(null)} 
    />;
  }

  const currentCategories = searchType === 'restaurants' ? restaurantCategories : foodCategories;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header với nút quay lại */}
      <div style={{
        background: '#fff',
        padding: '1rem 0',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff7043',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        category={category}
        setCategory={setCategory}
        categories={currentCategories}
        onSearch={() => handleSearch(1)}
        searchType={searchType}
        setSearchType={setSearchType}
      />

      {/* Results */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: '#666',
            fontSize: '18px'
          }}>
            <div style={{ marginBottom: '1rem' }}>🔄</div>
            Đang tìm kiếm...
          </div>
        )}

        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '1rem', 
            borderRadius: '8px',
            textAlign: 'center',
            margin: '1rem 0'
          }}>
            {error}
          </div>
        )}

        {hasSearched && !loading && !error && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>
              Kết quả tìm kiếm {searchType === 'restaurants' ? 'nhà hàng' : 'món ăn'}
              {query && ` cho "${query}"`}
              {category !== 'all' && ` - ${category}`}
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              Tìm thấy {pagination.total} {searchType === 'restaurants' ? 'nhà hàng' : 'món ăn'}
            </p>
          </div>
        )}

        {/* Restaurant Results */}
        {restaurants.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {restaurants.map(restaurant => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant} 
                  onSelect={setSelectedRestaurantId}
                />
              ))}
            </div>
          </>
        )}

        {/* Food Results */}
        {foods.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {foods.map(food => (
                <FoodCard 
                  key={food.id} 
                  food={food}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (restaurants.length > 0 || foods.length > 0) && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.5rem',
            marginTop: '2rem'
          }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handleSearch(page)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: page === pagination.page ? '#ff7043' : '#e0e0e0',
                  color: page === pagination.page ? '#fff' : '#666',
                  cursor: 'pointer',
                  fontWeight: page === pagination.page ? '600' : '400'
                }}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {hasSearched && !loading && restaurants.length === 0 && foods.length === 0 && !error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            color: '#666'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>
              Không tìm thấy {searchType === 'restaurants' ? 'nhà hàng' : 'món ăn'} nào
            </h3>
            <p style={{ margin: 0, fontSize: '16px' }}>
              Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
