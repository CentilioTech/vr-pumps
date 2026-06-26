"use client";

import Image from 'next/image';
import { useState } from 'react';
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import FavouriteButton from '@/components/favourite-button.js';

import product1 from "@/images/homepage/fold5/product1.png";
import product2 from "@/images/homepage/fold5/product2.png";
import product3 from "@/images/homepage/fold5/product3.png";
import product4 from "@/images/homepage/fold5/product4.png";
import product5 from "@/images/homepage/fold5/product5.png";
import product6 from "@/images/homepage/fold5/product6.png";
import product7 from "@/images/homepage/fold5/product7.png";
import product8 from "@/images/homepage/fold5/product8.png";
import product9 from "@/images/homepage/fold5/product9.png";
import product10 from "@/images/homepage/fold5/product10.png";
import product11 from "@/images/homepage/fold5/product11.png";
import product12 from "@/images/homepage/fold5/product12.png";
import product13 from "@/images/homepage/fold5/product13.png";
import product14 from "@/images/homepage/fold5/product14.png";
import product15 from "@/images/homepage/fold5/product15.png";

export default function Fold5() {
  const [showAll, setShowAll] = useState(false);

  const products = [
    {
      id: 1,
      name: 'Shallopro',
      image: product1,
      description: 'Optimized For Shallow Well Lifting',
      price: '₹5,880',
      rating: 0,
      reviews: 0
    },
    {
      id: 2,
      name: 'Deepflow',
      image: product2,
      description: 'Deep Bore Works Across All Use Cases',
      price: '₹11,319',
      rating: 4,
      reviews: 40
    },
    {
      id: 3,
      name: 'Wellrise',
      image: product3,
      description: 'Rise Water Steadily From Deep Wells',
      price: '₹8,453',
      rating: 4,
      reviews: 125
    },
    {
      id: 4,
      name: 'Primemate',
      image: product4,
      description: 'Friendly And Helpful Tone Self-Priming Support',
      price: '₹3,234',
      rating: 5,
      reviews: 9
    },
    {
      id: 5,
      name: 'Suctionpro',
      image: product5,
      description: 'Driven By Power Defined By Suction',
      price: '₹4,778',
      rating: 0,
      reviews: 0
    },
    {
      id: 6,
      name: 'Megaflow',
      image: product6,
      description: 'High Discharge Potential Highlighted',
      price: '₹7,203',
      rating: 4,
      reviews: 40
    },
    {
      id: 7,
      name: 'Aquarise',
      image: product7,
      description: 'Where Pressure Meets Precision',
      price: '₹7,938',
      rating: 4,
      reviews: 125
    },
    {
      id: 8,
      name: 'Drainforce',
      image: product8,
      description: 'One Solution For Every Application',
      price: '₹6,000',
      rating: 5,
      reviews: 9
    },
    {
      id: 9,
      name: 'Zenflow',
      image: product9,
      description: 'Silent. Strength. Everyday',
      price: '₹5,366',
      rating: 0,
      reviews: 0
    },
    {
      id: 10,
      name: 'Cutmaxx',
      image: product10,
      description: 'Engineered To Cut Built To Perform',
      price: '₹19,845',
      rating: 4,
      reviews: 40
    },
    {
      id: 11,
      name: 'Stagepro',
      image: product11,
      description: 'Clean Flow, Precise Performance',
      price: '₹8,967',
      rating: 4,
      reviews: 125
    },
    {
      id: 12,
      name: 'Flowmaster',
      image: product12,
      description: 'Delivering Steadily High Volume',
      price: '₹4,079',
      rating: 5,
      reviews: 9
    },
    {
      id: 13,
      name: 'Flowmaxx',
      image: product13,
      description: 'Pumpup Your Waterflow',
      price: '₹8,269',
      rating: 0,
      reviews: 0
    },
    {
      id: 14,
      name: 'Aquaglow',
      image: product14,
      description: 'Visual Brilliance, Elegance In Every Drop',
      price: '₹5,366',
      rating: 4,
      reviews: 40
    },
    {
      id: 15,
      name: 'Sludgepro',
      image: product15,
      description: 'Handles The Heavy, Tackles The Tough',
      price: '₹14,553',
      rating: 4,
      reviews: 125
    }
  ];

  const displayedProducts = showAll ? products : products.slice(0, 8);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`text-2xl ${index < rating ? 'text-[#e9bc14]' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <section className="w-full py-12 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-18">
          What&apos;s trending
        </h2>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Wishlist Icon */}
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <FavouriteButton />
                </div>

                {/* Product Image */}
                <div className="aspect-square bg-gray-50 p-6 flex items-center justify-center">
                  <Image
                    src={product.image}
                    priority
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="px-4 py-6">
                <h3 className="text-md font-bold text-black mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-700 mb-3 min-h-[40px]">
                  {product.description}
                </p>
                <p className="text-lg font-bold text-gray-900 mb-2">
                  {product.price}
                </p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {renderStars(product.rating)}
                  </div>
                  {product.reviews >= 0 && (
                    <span className="text-sm text-blue-600">{product.reviews}</span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <InteractiveHoverButton text="Add to cart" className="w-50" />
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="hover:bg-[#377DFF] hover:text-white px-6 py-3 font-medium text-base transition-colors duration-300 cursor-pointer mx-auto gap-2 bg-[#fafbff] font-semibold text-[#377DFF] p-3 rounded-full border-[#21325B1A] border-solid border-[1.5px]"
          >
            {showAll ? 'Show less' : 'View all products'}
          </button>
        </div>
      </div>
    </section>
  );
}