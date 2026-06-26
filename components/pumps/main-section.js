"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import { ChevronDown, Grid, List, Filter, X } from 'lucide-react';
import { allProducts } from '@/components/pumps-list.js';
import FavouriteButton from '@/components/favourite-button.js';
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const MainSection = () => {
  // State for products with favorite status
  const [products, setProducts] = useState(allProducts);
  const [isMobile, setIsMobile] = useState(false);

  // State for filters
  const [priceFilters, setPriceFilters] = useState({
    '1000-2000': false,
    '2000-3000': false,
    '3000-10000': false,
    '10000-50000': false,
    '50000-100000': false,
    '100000-500000': false,
    '500000+': false
  });

  const [horsePowerFilters, setHorsePowerFilters] = useState({
    '0.5-1': false,
    '1-3': false,
    '3-5': false,
    '5-10': false,
    '10-25': false
  });

  const [motorSpeedFilters, setMotorSpeedFilters] = useState({
    '1800': false,
    '2900': false
  });

  const [maxHeadFilters, setMaxHeadFilters] = useState({
    '10': false,
    '20': false,
    '40': false,
    '60': false,
    '80': false,
    '100': false,
    '150': false
  });

  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [showPriceMore, setShowPriceMore] = useState(false);
  const [showHPMore, setShowHPMore] = useState(false);
  const [showSpeedMore, setShowSpeedMore] = useState(false);
  const [showHeadMore, setShowHeadMore] = useState(false);
  
  // Mobile filters toggle state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Function to toggle favorite status
  const toggleFavorite = (productId) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, isFavourite: !product.isFavourite }
          : product
      )
    );
  };

  const toggleCart = (productId) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, isAddedtoCart: !product.isAddedtoCart }
          : product
      )
    );
  };

  // Filter products based on selected filters (now using local products state)
  const filteredProducts = products.filter(product => {
    // Price filter
    const priceMatches = Object.entries(priceFilters).some(([range, isSelected]) => {
      if (!isSelected) return false;
      
      switch (range) {
        case '1000-2000':
          return product.price >= 1000 && product.price <= 2000;
        case '2000-3000':
          return product.price >= 2000 && product.price <= 3000;
        case '3000-10000':
          return product.price >= 3000 && product.price <= 10000;
        case '10000-50000':
          return product.price >= 10000 && product.price <= 50000;
        case '50000-100000':
          return product.price >= 50000 && product.price <= 100000;
        case '100000-500000':
          return product.price >= 100000 && product.price <= 500000;
        case '500000+':
          return product.price >= 500000;
        default:
          return false;
      }
    });

    // Horse Power filter
    const horsePowerMatches = Object.entries(horsePowerFilters).some(([range, isSelected]) => {
      if (!isSelected) return false;
      
      switch (range) {
        case '0.5-1':
          return product.horsePower >= 0.5 && product.horsePower <= 1;
        case '1-3':
          return product.horsePower > 1 && product.horsePower <= 3;
        case '3-5':
          return product.horsePower > 3 && product.horsePower <= 5;
        case '5-10':
          return product.horsePower > 5 && product.horsePower <= 10;
        case '10-25':
          return product.horsePower > 10 && product.horsePower <= 25;
        default:
          return false;
      }
    });

    // Motor Speed filter
    const motorSpeedMatches = Object.entries(motorSpeedFilters).some(([speed, isSelected]) => {
      if (!isSelected) return false;
      return product.motorSpeed === parseInt(speed);
    });

    // Maximum Head filter
    const maxHeadMatches = Object.entries(maxHeadFilters).some(([head, isSelected]) => {
      if (!isSelected) return false;
      return product.maximumHead <= parseInt(head);
    });

    // Check if any filters are applied
    const hasPriceFilter = Object.values(priceFilters).some(Boolean);
    const hasHorsePowerFilter = Object.values(horsePowerFilters).some(Boolean);
    const hasMotorSpeedFilter = Object.values(motorSpeedFilters).some(Boolean);
    const hasMaxHeadFilter = Object.values(maxHeadFilters).some(Boolean);

    // If no filters are applied, show all products
    if (!hasPriceFilter && !hasHorsePowerFilter && !hasMotorSpeedFilter && !hasMaxHeadFilter) {
      return true;
    }

    // Apply filters - product must match at least one filter in each category that has filters applied
    const pricePass = !hasPriceFilter || priceMatches;
    const horsePowerPass = !hasHorsePowerFilter || horsePowerMatches;
    const motorSpeedPass = !hasMotorSpeedFilter || motorSpeedMatches;
    const maxHeadPass = !hasMaxHeadFilter || maxHeadMatches;

    return pricePass && horsePowerPass && motorSpeedPass && maxHeadPass;
  });

  // Sort products based on sortBy value
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'a-to-z':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'relevance':
      default:
        return 0; // Keep original order
    }
  });

  React.useEffect(() => {
	  const checkMobile = () => {
	    setIsMobile(window.innerWidth < 640);
	  };
	  
	  checkMobile();
	  window.addEventListener('resize', checkMobile);
	  
	  return () => window.removeEventListener('resize', checkMobile);
	}, []);

  // Calculate pagination based on filtered products
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const resetPage = () => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  };

  // Use effect to reset page when filters change
  React.useEffect(() => {
    resetPage();
  }, [priceFilters, horsePowerFilters, motorSpeedFilters, maxHeadFilters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePriceFilterChange = (key) => {
    setPriceFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleHorsePowerFilterChange = (key) => {
    setHorsePowerFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMotorSpeedFilterChange = (key) => {
    setMotorSpeedFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMaxHeadFilterChange = (key) => {
    setMaxHeadFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`text-2xl ${index < rating ? 'text-[#e9bc14]' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const FilterSection = ({ title, children, showMore, setShowMore, hasMore = false }) => (
    <div className="mb-6">
      <h3 className="font-medium text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {children}
        {hasMore && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-[#1252c8] text-sm hover:underline cursor-pointer font-medium"
          >
            {showMore ? 'View less' : 'View more'}
          </button>
        )}
      </div>
    </div>
  );

  const CheckboxFilter = ({ label, count, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      </div>
      {count && <span className="text-xs text-gray-500">({count})</span>}
    </label>
  );

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-[1px] border-solid border-gray-90">
      {/* Wishlist Icon */}
      <div className={viewMode == 'list' ? 'sm:flex items-center gap-[50px]' : ''}>
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <FavouriteButton 
              isFavorite={product.isFavourite}
              onToggle={() => toggleFavorite(product.id)}
            />
          </div>

          {/* Product Image */}
          <div className="aspect-square bg-gray-50 p-6 flex items-center justify-center">
            <Image
              src={product.imageUrl}
              priority
              alt={product.name}
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
        </div>
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-1">{product.brand}</div>
          <h3 className="text-md font-bold text-black mb-1">
            {product.name}
          </h3>
          <div className="text-sm text-[#000000] mb-2 space-y-1">
            <div>HP: {product.horsePower} | Speed: {product.motorSpeed} RPM</div>
            <div>Max Head: {product.maximumHead}m</div>
          </div>
          <div className="text-lg font-semibold text-gray-900 mb-2">
            ₹{product.price.toLocaleString()}
          </div>
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {renderStars(product.rating)}
            </div>
            {product.reviews >= 0 && (
              <span className="text-sm text-blue-600">{product.reviews}</span>
            )}
          </div>
          {product.isAddedtoCart ? (
        <button 
          onClick={() => toggleCart(product.id)}
          className="w-fit bg-red-500 hover:bg-red-600 font-medium text-white py-2 px-4 rounded transition-colors cursor-pointer"
        >
          Remove from cart
        </button>
      ) : (
        <InteractiveHoverButton 
          text="Add to cart" 
          className="w-50" 
          onClick={() => toggleCart(product.id)}
        />
      )}
        </div>
      </div>
    </div>
  );

  const FiltersContent = () => (
    <>
      {/* Price Filter */}
      <FilterSection 
        title="Price" 
        showMore={showPriceMore} 
        setShowMore={setShowPriceMore}
        hasMore={true}
      >
        <CheckboxFilter
          label="₹1000 - ₹2000"
          count="12"
          checked={priceFilters['1000-2000']}
          onChange={() => handlePriceFilterChange('1000-2000')}
        />
        <CheckboxFilter
          label="₹2000 - ₹3000"
          count="18"
          checked={priceFilters['2000-3000']}
          onChange={() => handlePriceFilterChange('2000-3000')}
        />
        <CheckboxFilter
          label="₹3000 - ₹10000"
          count="24"
          checked={priceFilters['3000-10000']}
          onChange={() => handlePriceFilterChange('3000-10000')}
        />
        {showPriceMore && (
          <>
            <CheckboxFilter
              label="₹10000 - ₹50000"
              count="15"
              checked={priceFilters['10000-50000']}
              onChange={() => handlePriceFilterChange('10000-50000')}
            />
            <CheckboxFilter
              label="₹50000 - ₹100000"
              count="8"
              checked={priceFilters['50000-100000']}
              onChange={() => handlePriceFilterChange('50000-100000')}
            />
            <CheckboxFilter
              label="₹100000 - ₹500000"
              count="3"
              checked={priceFilters['100000-500000']}
              onChange={() => handlePriceFilterChange('100000-500000')}
            />
          </>
        )}
      </FilterSection>

      {/* Horse Power Filter */}
      <FilterSection 
        title="Horse Power" 
        showMore={showHPMore} 
        setShowMore={setShowHPMore}
        hasMore={true}
      >
        <CheckboxFilter
          label="0.5 to 1 HP"
          count="3"
          checked={horsePowerFilters['0.5-1']}
          onChange={() => handleHorsePowerFilterChange('0.5-1')}
        />
        <CheckboxFilter
          label="1 to 3 HP"
          count="5"
          checked={horsePowerFilters['1-3']}
          onChange={() => handleHorsePowerFilterChange('1-3')}
        />
        {showHPMore && (
          <>
            <CheckboxFilter
              label="3 to 5 HP"
              count="7"
              checked={horsePowerFilters['3-5']}
              onChange={() => handleHorsePowerFilterChange('3-5')}
            />
            <CheckboxFilter
              label="5 to 10 HP"
              count="2"
              checked={horsePowerFilters['5-10']}
              onChange={() => handleHorsePowerFilterChange('5-10')}
            />
            <CheckboxFilter
              label="10 to 25 HP"
              count="2"
              checked={horsePowerFilters['10-25']}
              onChange={() => handleHorsePowerFilterChange('10-25')}
            />
          </>
        )}
      </FilterSection>

      {/* Motor Speed Filter */}
      <FilterSection 
        title="Motor Speed" 
        showMore={showSpeedMore} 
        setShowMore={setShowSpeedMore}
      >
        <CheckboxFilter
          label="1800 RPM"
          count="61"
          checked={motorSpeedFilters['1800']}
          onChange={() => handleMotorSpeedFilterChange('1800')}
        />
        <CheckboxFilter
          label="2900 RPM"
          count="11"
          checked={motorSpeedFilters['2900']}
          onChange={() => handleMotorSpeedFilterChange('2900')}
        />
      </FilterSection>

      {/* Maximum Head Filter */}
      <FilterSection 
        title="Maximum Head" 
        showMore={showHeadMore} 
        setShowMore={setShowHeadMore}
        hasMore={true}
      >
        <CheckboxFilter
          label="Upto 10 meters"
          count="8"
          checked={maxHeadFilters['10']}
          onChange={() => handleMaxHeadFilterChange('10')}
        />
        <CheckboxFilter
          label="Upto 20 meters"
          count="2"
          checked={maxHeadFilters['20']}
          onChange={() => handleMaxHeadFilterChange('20')}
        />
        <CheckboxFilter
          label="Upto 40 meters"
          count="1"
          checked={maxHeadFilters['40']}
          onChange={() => handleMaxHeadFilterChange('40')}
        />
        {showHeadMore && (
          <>
            <CheckboxFilter 
              label="Upto 60 meters"
              count="3"
              checked={maxHeadFilters['60']}
              onChange={() => handleMaxHeadFilterChange('60')}
            />
            <CheckboxFilter
              label="Upto 80 meters"
              count="5"
              checked={maxHeadFilters['80']}
              onChange={() => handleMaxHeadFilterChange('80')}
            />
            <CheckboxFilter
              label="Upto 100 meters"
              count="3"
              checked={maxHeadFilters['100']}
              onChange={() => handleMaxHeadFilterChange('100')}
            />
          </>
        )}
      </FilterSection>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Title Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Pumps</h1>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Filters Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Filters Section (collapsible) */}
        {showMobileFilters && (
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <FiltersContent />
              </div>
            </div>
          </div>
        )}

        {/* Desktop Layout: Flex with sidebar */}
        <div className="flex gap-6">
          {/* Left Sidebar - Filters (shown only on desktop) */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <FiltersContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {sortedProducts.length} pumps (Page {currentPage} of {totalPages || 1})
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="a-to-z">A to Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1 border border-gray-300 rounded overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${
                        viewMode === 'grid'
                          ? 'bg-[#377DFF] text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${
                        viewMode === 'list'
                          ? 'bg-[#377DFF] text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            
            {/* Pagination */}
			<div className="flex justify-center mt-8">
			  <div className="flex items-center gap-1">
			    <button 
			      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
			      disabled={currentPage === 1}
			      className={`px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${
			        currentPage === 1 
			          ? 'text-gray-400 cursor-not-allowed' 
			          : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
			      }`}
			    >
			      <span className="hidden sm:inline">Previous</span>
			      <span className="sm:hidden">Prev</span>
			    </button>
			    
			    {/* Page Numbers */}
			    {(() => {
			      const pages = [];
			      const maxVisiblePages = isMobile ? 3 : 5; // 3 pages on mobile, 5 on desktop
			      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
			      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
			      
			      // Adjust start page if we're near the end
			      if (endPage - startPage + 1 < maxVisiblePages) {
			        startPage = Math.max(1, endPage - maxVisiblePages + 1);
			      }
			      
			      // On mobile, show simplified pagination
			      if (isMobile) {
			        // Show first page if not in range
			        if (startPage > 1) {
			          pages.push(
			            <button
			              key={1}
			              onClick={() => handlePageChange(1)}
			              className="px-2 py-2 rounded text-xs text-gray-700 hover:bg-gray-100 cursor-pointer min-w-[32px]"
			            >
			              1
			            </button>
			          );
			          
			          if (startPage > 2) {
			            pages.push(
			              <span key="start-ellipsis" className="px-1 py-2 text-gray-500 text-xs">...</span>
			            );
			          }
			        }
			        
			        // Show pages in range
			        for (let i = startPage; i <= endPage; i++) {
			          pages.push(
			            <button
			              key={i}
			              onClick={() => handlePageChange(i)}
			              className={`px-2 py-2 rounded cursor-pointer text-xs min-w-[32px] ${
			                i === currentPage
			                  ? 'bg-[#377DFF] text-white'
			                  : 'text-gray-700 hover:bg-gray-100'
			              }`}
			            >
			              {i}
			            </button>
			          );
			        }
			        
			        // Show last page if not in range
			        if (endPage < totalPages) {
			          if (endPage < totalPages - 1) {
			            pages.push(
			              <span key="end-ellipsis" className="px-1 py-2 text-gray-500 text-xs">...</span>
			            );
			          }
			          
			          pages.push(
			            <button
			              key={totalPages}
			              onClick={() => handlePageChange(totalPages)}
			              className="px-2 py-2 rounded text-xs text-gray-700 hover:bg-gray-100 cursor-pointer min-w-[32px]"
			            >
			              {totalPages}
			            </button>
			          );
			        }
			      } else {
			        // Desktop pagination (existing logic)
			        // Always show page 1 if not in range
			        if (startPage > 1) {
			          pages.push(
			            <button
			              key={1}
			              onClick={() => handlePageChange(1)}
			              className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
			            >
			              1
			            </button>
			          );
			          
			          if (startPage > 2) {
			            pages.push(
			              <span key="start-ellipsis" className="px-3 py-2 text-gray-500">...</span>
			            );
			          }
			        }
			        
			        // Show pages in range
			        for (let i = startPage; i <= endPage; i++) {
			          pages.push(
			            <button
			              key={i}
			              onClick={() => handlePageChange(i)}
			              className={`px-3 py-2 rounded cursor-pointer ${
			                i === currentPage
			                  ? 'bg-[#377DFF] text-white'
			                  : 'text-gray-700 hover:bg-gray-100'
			              }`}
			            >
			              {i}
			            </button>
			          );
			        }
			        
			        // Always show last page if not in range
			        if (endPage < totalPages) {
			          if (endPage < totalPages - 1) {
			            pages.push(
			              <span key="end-ellipsis" className="px-3 py-2 text-gray-500">...</span>
			            );
			          }
			          
			          pages.push(
			            <button
			              key={totalPages}
			              onClick={() => handlePageChange(totalPages)}
			              className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
			            >
			              {totalPages}
			            </button>
			          );
			        }
			      }
			      
			      return pages;
			    })()}
			    
			    <button 
			      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
			      disabled={currentPage === totalPages}
			      className={`px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${
			        currentPage === totalPages 
			          ? 'text-gray-400 cursor-not-allowed' 
			          : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
			      }`}
			    >
			      <span className="hidden sm:inline">Next</span>
			      <span className="sm:hidden">Next</span>
			    </button>
			  </div>
			</div>



          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSection;