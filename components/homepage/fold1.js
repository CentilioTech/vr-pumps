"use client";

import Image from 'next/image';
import fold1image1 from '@/images/homepage/fold1/fold1image1.png';
import arrowRight from '@/images/homepage/arrow-right.png';
import arrowLeft from '@/images/homepage/arrow-left.png';
import FavouriteButton from '@/components/favourite-button.js';

export default function Fold1() {
  return (
    <section className="w-full bg-[#F7FAFF] py-12 md:py-16 lg:py-30">
      <div className="xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Navigation Arrows */}
          <button className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-12 lg:-translate-x-16 bg-white rounded-full shadow-lg p-3 hover:shadow-xl transition-shadow duration-200 cursor-pointer z-10 hidden md:block">
            <Image
              src={arrowLeft}
              alt="Previous"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
          
          <button className="absolute right-10 top-1/2 -translate-y-1/2 translate-x-12 lg:translate-x-16 bg-white rounded-full shadow-lg p-3 hover:shadow-xl transition-shadow duration-200 cursor-pointer z-10 hidden md:block">
            <Image
              src={arrowRight}
              alt="Next"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center px-10">
            {/* Product Image */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-1">
              <div className="relative w-full max-w-md lg:max-w-lg">
                <Image
                  src={fold1image1}
                  priority
                  alt="Flowmaxx Pump"
                  width={500}
                  height={400}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>

            {/* Product Information */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6">
                Flowmaxx
              </h1>
              
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Flowmaxx is specifically designed to provide consistent 
                high-pressure water output for residential and industrial 
                use. Its compact and stainless-steel construction makes it 
                corrosion-resistant and ideal for locations such as villas, 
                high-rise buildings, hotels, and commercial spaces.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="bg-[#377DFF] text-white px-6 py-3 rounded-lg font-medium text-base transition-colors duration-300 cursor-pointer flex items-center gap-2 hover:bg-[#e4ebff] hover:text-[#000000]">
                  $15 - Add to cart
                </button>
                
                <FavouriteButton />
              </div>
            </div>
          </div>

          {/* Mobile Navigation Arrows */}
          <div className="flex justify-center gap-4 mt-8 md:hidden">
            <button className="bg-white rounded-full shadow-lg p-3 hover:shadow-xl transition-shadow duration-200 cursor-pointer">
              <Image
                src={arrowLeft}
                alt="Previous"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>
            
            <button className="bg-white rounded-full shadow-lg p-3 hover:shadow-xl transition-shadow duration-200 cursor-pointer">
              <Image
                src={arrowRight}
                alt="Next"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}