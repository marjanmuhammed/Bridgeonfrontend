import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Users, TrendingUp, Building2, Award, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';

// ==========================================
// SPHERE COMPONENT
// ==========================================

const SphereImageGrid = ({
  images = [],
  containerSize = 400,
  sphereRadius = 200,
  dragSensitivity = 0.5,
  momentumDecay = 0.95,
  maxRotationSpeed = 5,
  baseImageScale = 0.12,
  hoverScale = 1.2,
  perspective = 1000,
  autoRotate = false,
  autoRotateSpeed = 0.3,
  className = ''
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [rotation, setRotation] = useState({ x: 15, y: 15, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePositions, setImagePositions] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const containerRef = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);

  const SPHERE_MATH = {
    degreesToRadians: (degrees) => degrees * (Math.PI / 180),
    radiansToDegrees: (radians) => radians * (180 / Math.PI),
    sphericalToCartesian: (radius, theta, phi) => ({
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta)
    }),
    calculateDistance: (pos, center = { x: 0, y: 0, z: 0 }) => {
      const dx = pos.x - center.x;
      const dy = pos.y - center.y;
      const dz = pos.z - center.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    normalizeAngle: (angle) => {
      while (angle > 180) angle -= 360;
      while (angle < -180) angle += 360;
      return angle;
    }
  };

  const actualSphereRadius = sphereRadius || containerSize * 0.5;
  const baseImageSize = containerSize * baseImageScale;

  const generateSpherePositions = useCallback(() => {
    const positions = [];
    const imageCount = images.length;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = 2 * Math.PI / goldenRatio;

    for (let i = 0; i < imageCount; i++) {
      const t = i / imageCount;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      let phi = inclination * (180 / Math.PI);
      let theta = (azimuth * (180 / Math.PI)) % 360;

      const poleBonus = Math.pow(Math.abs(phi - 90) / 90, 0.6) * 35;
      if (phi < 90) {
        phi = Math.max(5, phi - poleBonus);
      } else {
        phi = Math.min(175, phi + poleBonus);
      }

      phi = 15 + (phi / 180) * 150;

      const randomOffset = (Math.random() - 0.5) * 20;
      theta = (theta + randomOffset) % 360;
      phi = Math.max(0, Math.min(180, phi + (Math.random() - 0.5) * 10));

      positions.push({
        theta: theta,
        phi: phi,
        radius: actualSphereRadius
      });
    }

    return positions;
  }, [images.length, actualSphereRadius]);

  const calculateWorldPositions = useCallback(() => {
    const positions = imagePositions.map((pos, index) => {
      const thetaRad = SPHERE_MATH.degreesToRadians(pos.theta);
      const phiRad = SPHERE_MATH.degreesToRadians(pos.phi);
      const rotXRad = SPHERE_MATH.degreesToRadians(rotation.x);
      const rotYRad = SPHERE_MATH.degreesToRadians(rotation.y);

      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad);
      let y = pos.radius * Math.cos(phiRad);
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad);

      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad);
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad);
      x = x1;
      z = z1;

      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad);
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad);
      y = y2;
      z = z2;

      const worldPos = { x, y, z };

      const fadeZoneStart = -10;
      const fadeZoneEnd = -30;
      const isVisible = worldPos.z > fadeZoneEnd;

      let fadeOpacity = 1;
      if (worldPos.z <= fadeZoneStart) {
        fadeOpacity = Math.max(0, (worldPos.z - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd));
      }

      const isPoleImage = pos.phi < 30 || pos.phi > 150;
      const distanceFromCenter = Math.sqrt(worldPos.x * worldPos.x + worldPos.y * worldPos.y);
      const maxDistance = actualSphereRadius;
      const distanceRatio = Math.min(distanceFromCenter / maxDistance, 1);

      const distancePenalty = isPoleImage ? 0.4 : 0.7;
      const centerScale = Math.max(0.3, 1 - distanceRatio * distancePenalty);

      const depthScale = (worldPos.z + actualSphereRadius) / (2 * actualSphereRadius);
      const scale = centerScale * Math.max(0.5, 0.8 + depthScale * 0.3);

      return {
        ...worldPos,
        scale,
        zIndex: Math.round(1000 + worldPos.z),
        isVisible,
        fadeOpacity,
        originalIndex: index
      };
    });

    const adjustedPositions = [...positions];

    for (let i = 0; i < adjustedPositions.length; i++) {
      const pos = adjustedPositions[i];
      if (!pos.isVisible) continue;

      let adjustedScale = pos.scale;
      const imageSize = baseImageSize * adjustedScale;

      for (let j = 0; j < adjustedPositions.length; j++) {
        if (i === j) continue;

        const other = adjustedPositions[j];
        if (!other.isVisible) continue;

        const otherSize = baseImageSize * other.scale;
        const dx = pos.x - other.x;
        const dy = pos.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (imageSize + otherSize) / 2 + 25;

        if (distance < minDistance && distance > 0) {
          const overlap = minDistance - distance;
          const reductionFactor = Math.max(0.4, 1 - (overlap / minDistance) * 0.6);
          adjustedScale = Math.min(adjustedScale, adjustedScale * reductionFactor);
        }
      }

      adjustedPositions[i] = {
        ...pos,
        scale: Math.max(0.25, adjustedScale)
      };
    }

    return adjustedPositions;
  }, [imagePositions, rotation, actualSphereRadius, baseImageSize]);

  const clampRotationSpeed = useCallback((speed) => {
    return Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, speed));
  }, [maxRotationSpeed]);

  const updateMomentum = useCallback(() => {
    if (isDragging) return;

    setVelocity(prev => {
      const newVelocity = {
        x: prev.x * momentumDecay,
        y: prev.y * momentumDecay
      };

      if (!autoRotate && Math.abs(newVelocity.x) < 0.01 && Math.abs(newVelocity.y) < 0.01) {
        return { x: 0, y: 0 };
      }

      return newVelocity;
    });

    setRotation(prev => {
      let newY = prev.y;

      if (autoRotate) {
        newY += autoRotateSpeed;
      }

      newY += clampRotationSpeed(velocity.y);

      return {
        x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(velocity.x)),
        y: SPHERE_MATH.normalizeAngle(newY),
        z: prev.z
      };
    });
  }, [isDragging, momentumDecay, velocity, clampRotationSpeed, autoRotate, autoRotateSpeed]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setVelocity({ x: 0, y: 0 });
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    const rotationDelta = {
      x: -deltaY * dragSensitivity,
      y: deltaX * dragSensitivity
    };

    setRotation(prev => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
      z: prev.z
    }));

    setVelocity({
      x: clampRotationSpeed(rotationDelta.x),
      y: clampRotationSpeed(rotationDelta.y)
    });

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, dragSensitivity, clampRotationSpeed]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setVelocity({ x: 0, y: 0 });
    lastMousePos.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - lastMousePos.current.x;
    const deltaY = touch.clientY - lastMousePos.current.y;

    const rotationDelta = {
      x: -deltaY * dragSensitivity,
      y: deltaX * dragSensitivity
    };

    setRotation(prev => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
      z: prev.z
    }));

    setVelocity({
      x: clampRotationSpeed(rotationDelta.x),
      y: clampRotationSpeed(rotationDelta.y)
    });

    lastMousePos.current = { x: touch.clientX, y: touch.clientY };
  }, [isDragging, dragSensitivity, clampRotationSpeed]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setImagePositions(generateSpherePositions());
  }, [generateSpherePositions]);

  useEffect(() => {
    const animate = () => {
      updateMomentum();
      animationFrame.current = requestAnimationFrame(animate);
    };

    if (isMounted) {
      animationFrame.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isMounted, updateMomentum]);

  useEffect(() => {
    if (!isMounted) return;

    const container = containerRef.current;
    if (!container) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMounted, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const worldPositions = calculateWorldPositions();

  const renderImageNode = useCallback((image, index) => {
    const position = worldPositions[index];

    if (!position || !position.isVisible) return null;

    const imageSize = baseImageSize * position.scale;
    const isHovered = hoveredIndex === index;
    const finalScale = isHovered ? Math.min(1.2, 1.2 / position.scale) : 1;

    return (
      <div
        key={image.id}
        className="absolute cursor-pointer select-none transition-transform duration-200 ease-out"
        style={{
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          left: `${containerSize/2 + position.x}px`,
          top: `${containerSize/2 + position.y}px`,
          opacity: position.fadeOpacity,
          transform: `translate(-50%, -50%) scale(${finalScale})`,
          zIndex: position.zIndex
        }}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => setSelectedImage(image)}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg border-2 border-white/20">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
            draggable={false}
            loading={index < 3 ? 'eager' : 'lazy'}
          />
        </div>
      </div>
    );
  }, [worldPositions, baseImageSize, containerSize, hoveredIndex]);

  const renderSpotlightModal = () => {
    if (!selectedImage) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
        onClick={() => setSelectedImage(null)}
        style={{
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        <div
          className="bg-white rounded-xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'scaleIn 0.3s ease-out'
          }}
        >
          <div className="relative aspect-square">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full text-white flex items-center justify-center hover:bg-opacity-70 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {(selectedImage.title || selectedImage.description) && (
            <div className="p-6">
              {selectedImage.title && (
                <h3 className="text-xl font-bold mb-2">{selectedImage.title}</h3>
              )}
              {selectedImage.description && (
                <p className="text-gray-600">{selectedImage.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div
        className="bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div
        className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="text-gray-400 text-center">
          <p>No images provided</p>
          <p className="text-sm">Add images to the images prop</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`relative select-none cursor-grab active:cursor-grabbing ${className}`}
        style={{
          width: containerSize,
          height: containerSize,
          perspective: `${perspective}px`
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="relative w-full h-full" style={{ zIndex: 10 }}>
          {images.map((image, index) => renderImageNode(image, index))}
        </div>
      </div>

      {renderSpotlightModal()}
    </>
  );
};

// ==========================================
// ANIMATED COUNTER COMPONENT
// ==========================================

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let startTime = null;
          const animateCount = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * end);
            
            setCount(currentCount);
            
            if (progress < 1) {
              requestAnimationFrame(animateCount);
            }
          };
          
          requestAnimationFrame(animateCount);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={countRef}>
      {count}{suffix}
    </span>
  );
};

// ==========================================
// PLACEMENT PAGE COMPONENT
// ==========================================

export default function Placements() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Your placement images from public folder
  const BASE_IMAGES = [
    {
      src: "/placements/placement1.jpeg",
      alt: "Placement 1",
    },
    {
      src: "/placements/placement2.jpeg",
      alt: "Placement 2",
    },
    {
      src: "/placements/placement3.jpeg",
      alt: "Placement 3",
    },
    {
      src: "/placements/placement4.jpeg",
      alt: "Placement 4",
    },
    {
      src: "/placements/placement5.jpeg",
      alt: "Placement 5",
    },
    {
      src: "/placements/placement6.jpeg",
      alt: "Placement 6",
    },
  ];

  // Generate more images by repeating the base set
  const IMAGES = [];
  for (let i = 0; i < 48; i++) {
    const baseIndex = i % BASE_IMAGES.length;
    const baseImage = BASE_IMAGES[baseIndex];
    IMAGES.push({
      id: `placement-${i + 1}`,
      ...baseImage,
      alt: `${baseImage.alt} ${Math.floor(i / BASE_IMAGES.length) + 1}`,
    });
  }

  const scrollToStats = () => {
    document.getElementById('stats-section').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <main className="w-full min-h-screen bg-black text-white">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        .gradient-text {
          background: linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stats-card {
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-md py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
           
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        
        <div className="text-center py-12 px-6 relative z-10 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Explore Our <span className="gradient-text">Successful</span> Placements
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Discover the amazing career journeys of our students who have secured positions 
            at top companies worldwide with outstanding packages. Your dream career starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={scrollToStats}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              View Statistics
              <ChevronDown size={20} />
            </button>
            <button
             onClick={scrollToStats}
             className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-white/10">
              Join Success Stories
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full floating opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full floating opacity-40" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-pink-400 rounded-full floating opacity-70" style={{animationDelay: '4s'}}></div>
      </section>

      {/* Sphere Animation Section */}
      <section className="relative py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="flex justify-center items-center px-6">
          <SphereImageGrid
            images={IMAGES}
            containerSize={800}
            sphereRadius={280}
            dragSensitivity={0.8}
            momentumDecay={0.96}
            maxRotationSpeed={6}
            baseImageScale={0.12}
            hoverScale={1.3}
            perspective={1000}
            autoRotate={true}
            autoRotateSpeed={0.2}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Placement <span className="gradient-text">Statistics</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our consistent track record of placing students in top-tier companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="stats-card text-center p-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl">
              <div className="flex justify-center mb-4">
                <Users size={48} className="text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={500} suffix="+" />
              </div>
              <div className="text-blue-100 text-lg font-semibold">Students Placed</div>
            </div>

            <div className="stats-card text-center p-8 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl">
              <div className="flex justify-center mb-4">
                <TrendingUp size={48} className="text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                ₹<AnimatedCounter end={3} suffix="LPA+"/>
              </div>
              <div className="text-green-100 text-lg font-semibold">Highest Package</div>
            </div>

            <div className="stats-card text-center p-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl">
              <div className="flex justify-center mb-4">
                <Building2 size={48} className="text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={75} suffix="+" />
              </div>
              <div className="text-purple-100 text-lg font-semibold">Top Companies</div>
            </div>

            <div className="stats-card text-center p-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl">
              <div className="flex justify-center mb-4">
                <Award size={48} className="text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <div className="text-orange-100 text-lg font-semibold">Placement Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Stats Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                <AnimatedCounter end={150} suffix="+" />
              </div>
              <div className="text-gray-300 text-lg">MNC Recruiters</div>
            </div>
            <div className="p-8">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                ₹<AnimatedCounter end={4.5} suffix="LPA"/>
              </div>
              <div className="text-gray-300 text-lg">Average Package</div>
            </div>
            <div className="p-8">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                <AnimatedCounter end={95} suffix="%" />
              </div>
              <div className="text-gray-300 text-lg">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
             
              <p className="text-gray-300 mb-6 max-w-md">
                Transforming careers and shaping futures through quality education and exceptional placement opportunities.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center text-gray-300">
                  <Phone size={20} className="mr-2" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail size={20} className="mr-2" />
                  <span>placements@bridgeon.com</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#home" className="hover:text-blue-400 transition-colors">Home</a></li>
                <li><a href="#stats" className="hover:text-blue-400 transition-colors">Statistics</a></li>
                <li><a href="#companies" className="hover:text-blue-400 transition-colors">Companies</a></li>
                <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start">
                  <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                  <span> Kinfra It Park, Kakanchery <br />Calicut, Kerala </span>
                </div>
                <div className="flex items-center">
                  <Phone size={18} className="mr-2" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail size={18} className="mr-2" />
                  <span>info@bridgeon.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bridgeon Solutions. All rights reserved. | Designed with ❤️ for aspiring professionals</p>
          </div>
        </div>
      </footer>
    </main>
  );
}