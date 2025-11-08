"use client";

import React, { useState, useRef } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useScroll,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";

const people = [
  {
    id: 1,
    name: "Jabir Ismail",
    designation: "Founder and CEO",
    image: "/BridgeoneWal/ceo.jpg",
  },
  {
    id: 2,
    name: "Nasheed",
    designation: "Head of Operations",
    image: "/BridgeoneWal/Nasheeekka-1.webp",
  },
  {
    id: 3,
    name: "Sreelakshmi Nair",
    designation: "HR Manager",
    image: "/BridgeoneWal/sreelakshmi.jpg",
  },
  {
    id: 4,
    name: "Haribharathi Subramani",
    designation: "Head of Tamil Media and Operations",
    image: "/BridgeoneWal/hari.jpg",
  },
  {
    id: 5,
    name: "Rahul Varma",
    designation: "Academic Head",
    image: "/BridgeoneWal/rahulvarma.jpg",
  },
  {
    id: 6,
    name: "Shahin Sha",
    designation: "Operations Manager",
    image: "/BridgeoneWal/Shahin-kaku-1.webp",
  },
];

// Custom Hook for Element Width
function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  React.useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);

  return width;
}

// ScrollVelocity Component
const ScrollVelocity = ({
  texts = [],
  velocity = 50,
  className = '',
}) => {
  function VelocityText({
    children,
    baseVelocity = velocity,
    className = '',
  }) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: 50,
      stiffness: 400
    });
    const velocityFactor = useTransform(
      smoothVelocity,
      [0, 1000],
      [0, 5],
      { clamp: false }
    );

    const copyRef = useRef(null);
    const copyWidth = useElementWidth(copyRef);

    function wrap(min, max, v) {
      const range = max - min;
      const mod = (((v - min) % range) + range) % range;
      return mod + min;
    }

    const x = useTransform(baseX, v => {
      if (copyWidth === 0) return '0px';
      return `${wrap(-copyWidth, 0, v)}px`;
    });

    const directionFactor = useRef(1);
    useAnimationFrame((t, delta) => {
      let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get();
      baseX.set(baseX.get() + moveBy);
    });

    const spans = [];
    for (let i = 0; i < 6; i++) {
      spans.push(
        <span className={className} key={i} ref={i === 0 ? copyRef : null}>
          {children}
        </span>
      );
    }

    return (
      <div className="parallax overflow-hidden py-4">
        <motion.div className="scroller flex whitespace-nowrap" style={{ x }}>
          {spans}
        </motion.div>
      </div>
    );
  }

  return (
    <section>
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
        >
          {text}&nbsp;
        </VelocityText>
      ))}
    </section>
  );
};

// Image Gallery Component
const ImageGallery = () => {
  return (
    <section className="w-full flex flex-col items-center justify-start py-12">
      <div className="max-w-3xl text-center px-4">
        <h1 className="text-3xl font-semibold text-gray-800">Our Training Centers</h1>
        <p className="text-sm text-gray-600 mt-2">
          Explore our state-of-the-art training facilities across Kerala
        </p>
      </div>

      <div className="flex items-center gap-2 h-[400px] w-full max-w-5xl mt-10 px-4">
        {[

           "/placements/Learning-Community-web.jpg.webp",
          "/placements/DSC00445-scaled.jpg.webp",
          "/placements/282x380.jpg-01.jpg.webp",
          "/placements/Mentors-e1738930132755-1024x493.jpg.webp",
          "/placements/DSC00204-scaled-e1731389063599.jpg.webp",
          "/placements/DSC00363-scaled.jpg.webp",
        ].map((src, idx) => (
          <div
            key={idx}
            className="relative group flex-grow transition-all w-56 rounded-lg overflow-hidden h-[400px] duration-500 hover:w-full"
          >
            <img
              className="h-full w-full object-cover object-center"
              src={src}
              alt={`training-center-${idx}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

// About Section Component
const AboutSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          About Bridgeon Solutions
        </h1>
      </motion.div>

      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center"
            >
              <p className="text-gray-700 text-lg mb-6">
                Bridgeon Solutions is an IT training institute in Kerala that provides job-focused bootcamps, 
                bridging the gap between academic learning and industry demands to make students job-ready for the tech sector.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(true)}
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Learn More About Us
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-emerald-600 text-center">
                What We Offer
              </h2>
              
              <ul className="text-gray-700 space-y-4 text-lg">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 text-xl">•</span>
                  <span>IT training bootcamps in MERN, MEAN, Python, Java, Flutter, .NET, Software Testing, and Data Science</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 text-xl">•</span>
                  <span>Job-focused practical learning with real-world projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 text-xl">•</span>
                  <span>100% placement assistance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 text-xl">•</span>
                  <span>Pay-after-placement fee structure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 text-xl">•</span>
                  <span>Industry mentorship and internships</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 text-xl">•</span>
                  <span>Soft skills training included</span>
                </li>
              </ul>

              <div className="text-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsExpanded(false)}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Show Less
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AnimatedTooltip = ({ items, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  const handleMouseMove = (event) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {items.map((item) => (
        <div
          className="relative group"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-20 left-1/2 -translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-md bg-white z-50 shadow-xl px-4 py-2 border border-gray-200"
              >
                <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
                <div className="font-bold text-gray-800 relative z-30 text-base">
                  {item.name}
                </div>
                <div className="text-gray-600 text-xs">
                  {item.designation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            src={item.image}
            alt={item.name}
            className="object-cover !m-0 !p-0 object-top rounded-full h-16 w-16 border-2 group-hover:scale-110 group-hover:z-30 border-gray-300 relative transition duration-500 cursor-pointer"
          />
        </div>
      ))}
    </div>
  );
};

const ContactUsPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Scroll Velocity Animation - Single Line */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 py-4 border-b">
        <ScrollVelocity
          texts={['Bridgeon Solutions - IT Training Company - Kerala - Placement Focused - MERN Stack - MEAN Stack - Python Full Stack - Java - Flutter - Data Science']}
          velocity={30}
          className="text-xl md:text-2xl font-bold text-emerald-600"
        />
      </div>

      {/* About Section */}
      <AboutSection />

      {/* Image Gallery */}
      <ImageGallery />

      {/* Team Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our Leadership Team
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet the experienced professionals who are dedicated to shaping the future of IT education in Kerala
          </p>
        </motion.div>
        
        <div className="flex flex-row items-center justify-center w-full">
          <AnimatedTooltip items={people} />
        </div>
      </div>

      {/* CSS for ScrollVelocity */}
      <style jsx>{`
        .parallax {
          position: relative;
          overflow: hidden;
        }

        .scroller {
          display: flex;
          white-space: nowrap;
          text-align: center;
          font-weight: bold;
          letter-spacing: -0.02em;
        }

        .scroller span {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default ContactUsPage;