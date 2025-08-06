'use client';

import React, { useState } from 'react';

interface PosterImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const PosterImage: React.FC<PosterImageProps> = ({ 
  src, 
  alt, 
  className = "w-12 h-16 rounded object-cover",
  fallbackSrc = "/posters/Avatar.jpg"
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <div className="flex-shrink-0">
      <div className="w-12 h-16 rounded overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleError}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default PosterImage;
