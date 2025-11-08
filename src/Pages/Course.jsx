import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Award, Code2, TrendingUp, Sparkles, X, Palette, Box } from 'lucide-react';

// ---------- Course Data ----------
const courseData = [
  {
    name: "3D Designing",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blender/blender-original.svg",
    duration: "12 Weeks",
    description: "Master 3D modeling, animation, and rendering with Blender and industry tools",
    details: "Learn 3D modeling, texturing, lighting, animation, and rendering using Blender. Create stunning 3D assets, characters, environments, and animations for games, films, and architectural visualization.",
    color: "from-orange-400 to-red-500"
  },
  {
    name: "MERN Stack",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    duration: "24 Weeks",
    description: "Build full-stack applications with MongoDB, Express, React, and Node.js",
    details: "Master the full MERN stack: React for frontend, Node.js + Express for backend, MongoDB for database, REST APIs, authentication, deployment, and hands-on projects.",
    color: "from-cyan-400 to-blue-500"
  },
  {
    name: "Python Full Stack",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    duration: "16 Weeks",
    description: "Master Python with Django/Flask for complete web development",
    details: "Learn backend Python development with Django/Flask, integrate with databases, build REST APIs, handle authentication, and complete real-world projects.",
    color: "from-blue-400 to-indigo-500"
  },
  {
    name: "Golang",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
    duration: "26 Weeks",
    description: "Learn Go for high-performance backend systems and microservices",
    details: "Dive into Go programming, build microservices, REST APIs, handle concurrency, database integration, and deploy scalable backend systems.",
    color: "from-cyan-300 to-teal-500"
  },
  {
    name: "Java",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    duration: "26 Weeks",
    description: "Enterprise Java development with Spring Boot and advanced concepts",
    details: "Learn Java and Spring Boot, build REST APIs, integrate databases, manage authentication, unit testing, and create enterprise-grade applications.",
    color: "from-orange-400 to-red-500"
  },
  {
    name: "Machine Learning",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
    duration: "28 Weeks",
    description: "Deep dive into AI, neural networks, and predictive modeling",
    details: "Master ML algorithms, Python libraries (NumPy, Pandas, Scikit-learn), neural networks, TensorFlow, and real-world AI projects.",
    color: "from-amber-400 to-orange-500"
  },
  {
    name: ".NET",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg",
    duration: "26 Weeks",
    description: "Build scalable applications with .NET Core and C#",
    details: "Learn C#, .NET Core, MVC pattern, REST APIs, database integration, deployment, and create enterprise-ready applications.",
    color: "from-purple-400 to-violet-500"
  },
  {
    name: "Flutter",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
    duration: "22 Weeks",
    description: "Create beautiful cross-platform mobile apps with Flutter & Dart",
    details: "Learn Flutter framework, Dart programming, state management, UI design, backend integration, and deploy apps on iOS & Android.",
    color: "from-sky-400 to-blue-500"
  },
  {
    name: "MEAN Stack",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
    duration: "24 Weeks",
    description: "Full-stack JavaScript with MongoDB, Express, Angular, and Node.js",
    details: "Learn Angular for frontend, Node.js + Express for backend, MongoDB database, REST APIs, authentication, deployment, and full-stack projects.",
    color: "from-red-400 to-pink-500"
  },
];

// ---------- Stats ----------
const stats = [
  { icon: Users, value: "500+", label: "Students Trained" },
  { icon: Award, value: "95%", label: "Placement Rate" },
  { icon: Code2, value: "9+", label: "Tech Stacks" },
  { icon: TrendingUp, value: "4.8/5", label: "Student Rating" }
];

// ---------- Animated Logo Box ----------
const AnimatedLogoBox = ({ src, name, duration, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: parseFloat(delay) }}
    whileHover={{ scale: 1.08, rotateY: 10 }}
    className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-xl md:rounded-2xl mx-auto flex flex-col items-center justify-center bg-white shadow-lg border border-gray-100 overflow-hidden group"
  >
    {/* 3D Effect Layers */}
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-all duration-500 rounded-xl md:rounded-2xl`}></div>
    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl md:rounded-2xl"></div>
    
    <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl bg-gradient-to-br ${color} p-0.5 shadow-xl md:shadow-2xl flex items-center justify-center z-10 transform group-hover:scale-110 transition-transform duration-300`}>
      <div className="w-full h-full bg-white rounded-lg md:rounded-xl flex items-center justify-center">
        <img src={src} alt={name} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transform group-hover:scale-110 transition-transform duration-300" />
      </div>
    </div>
    <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-800 text-center z-10 px-1">{name}</p>
    <p className="text-xs text-gray-500 z-10">{duration}</p>
    
    {/* Shine Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
  </motion.div>
);

// ---------- Course Card ----------
const CourseCard = ({ course, index }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -10, rotateX: 5 }}
        className="relative group perspective-1000"
      >
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full transform-style-preserve-3d group-hover:rotate-y-2">
          {/* 3D Depth Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-10 rounded-xl md:rounded-2xl transition-opacity duration-300`}></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl md:rounded-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-3 md:mb-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg md:rounded-xl bg-gradient-to-br ${course.color} p-0.5 shadow-xl md:shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                <div className="w-full h-full bg-white rounded-lg md:rounded-xl flex items-center justify-center">
                  <img src={course.src} alt={course.name} className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-2">{course.name}</h3>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
              <span className="text-xs sm:text-sm font-semibold text-blue-600">{course.duration}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">{course.description}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDetails(true)}
              className={`w-full mt-3 md:mt-4 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r ${course.color} text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px]`}
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal for Detailed Info */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 180 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative transform-style-preserve-3d"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 3D Modal Effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl md:rounded-3xl blur-xl opacity-50"></div>
            
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${course.color} p-0.5`}>
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                    <img src={course.src} alt={course.name} className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{course.name}</h3>
                  <p className="text-xs md:text-sm text-gray-500">{course.duration}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg">{course.details}</p>
              
              {course.name === "3D Designing" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                    <h4 className="font-semibold text-orange-800 text-sm md:text-base">What You'll Master:</h4>
                  </div>
                  <ul className="text-xs md:text-sm text-orange-700 space-y-1">
                    <li>• 3D Modeling & Sculpting</li>
                    <li>• Texturing & Material Creation</li>
                    <li>• Lighting & Rendering</li>
                    <li>• Character Animation</li>
                    <li>• Visual Effects & Simulation</li>
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

// ---------- Main Component ----------
const Course = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating 3D Shapes */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-4 md:left-10 w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-40 right-4 md:right-20 w-24 h-24 md:w-40 md:h-40 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 right-1/4 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-green-400/20 to-cyan-400/20 rounded-lg blur-lg rotate-45"
        />
      </div>

      {/* New Course Banner - Moved to Top */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-orange-500 to-red-500 py-4 md:py-6 px-4 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute -right-10 -top-10 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-center">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Box className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl lg:text-3xl font-bold">🚀 We Launched New Course of 3D Designing!</h3>
                <p className="text-orange-100 text-sm md:text-base mt-1">Master Blender and create stunning 3D visuals</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-orange-600 px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 text-sm md:text-base shadow-lg whitespace-nowrap"
            >
              Enroll Now - Limited Seats
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 3D Design Section at the Top */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] pointer-events-auto z-10">
        <iframe
          src="https://my.spline.design/nexbotrobotcharacterconcept-BlMm5KEnwoqjRmuuyuNrjzcr/"
          frameBorder="0"
          className="w-full h-full"
          allow="fullscreen; autoplay; xr-spatial-tracking;"
          title="3D Design Showcase"
        ></iframe>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-12 md:py-16 lg:py-20 px-4">
        {/* 3D Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-4 md:top-10 left-4 md:left-10 w-40 h-40 md:w-72 md:h-72 bg-white rounded-full blur-2xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-4 md:bottom-10 right-4 md:right-10 w-48 h-48 md:w-96 md:h-96 bg-yellow-300 rounded-full blur-2xl"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2 rounded-full mb-4 md:mb-6"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
            <span className="text-white font-semibold text-sm md:text-base">Premium Tech Education</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Master the Future of
            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent mt-2">
              Technology
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your career with industry-leading tech stacks. From full-stack development to 3D design and AI/ML, we offer comprehensive training programs designed for real-world success.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-purple-600 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg shadow-xl md:shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:rotate-1"
          >
            Explore Courses
          </motion.button>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-10 mb-12 md:mb-16 relative z-10">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg text-center border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <stat.icon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 text-purple-600" />
              <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Animated Logo Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-12 md:mb-16 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 md:mb-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          All Domains 
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {courseData.map((course, index) => (
            <AnimatedLogoBox
              key={course.name}
              src={course.src}
              name={course.name}
              duration={course.duration}
              color={course.color}
              delay={`${index * 0.1}s`}
            />
          ))}
        </div>
      </div>

      {/* Courses Cards Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12 md:pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Explore Our Courses
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Dive deep into our comprehensive programs with detailed descriptions and real-world learning outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {courseData.map((course, index) => (
            <CourseCard key={index} course={course} index={index} />
          ))}
        </div>
      </div>

      {/* Custom CSS for 3D effects */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default Course;