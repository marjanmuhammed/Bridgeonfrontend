import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Award, Code2, TrendingUp, Sparkles, X } from 'lucide-react';

// ---------- Course Data ----------
const courseData = [
  {
    name: "MERN Stack",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    duration: "10 Weeks",
    description: "Build full-stack applications with MongoDB, Express, React, and Node.js",
    details: "Master the full MERN stack: React for frontend, Node.js + Express for backend, MongoDB for database, REST APIs, authentication, deployment, and hands-on projects.",
    color: "from-cyan-400 to-blue-500"
  },
  {
    name: "Python Full Stack",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    duration: "12 Weeks",
    description: "Master Python with Django/Flask for complete web development",
    details: "Learn backend Python development with Django/Flask, integrate with databases, build REST APIs, handle authentication, and complete real-world projects.",
    color: "from-blue-400 to-indigo-500"
  },
  {
    name: "Golang",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
    duration: "8 Weeks",
    description: "Learn Go for high-performance backend systems and microservices",
    details: "Dive into Go programming, build microservices, REST APIs, handle concurrency, database integration, and deploy scalable backend systems.",
    color: "from-cyan-300 to-teal-500"
  },
  {
    name: "Java",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    duration: "14 Weeks",
    description: "Enterprise Java development with Spring Boot and advanced concepts",
    details: "Learn Java and Spring Boot, build REST APIs, integrate databases, manage authentication, unit testing, and create enterprise-grade applications.",
    color: "from-orange-400 to-red-500"
  },
  {
    name: "Machine Learning",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
    duration: "16 Weeks",
    description: "Deep dive into AI, neural networks, and predictive modeling",
    details: "Master ML algorithms, Python libraries (NumPy, Pandas, Scikit-learn), neural networks, TensorFlow, and real-world AI projects.",
    color: "from-amber-400 to-orange-500"
  },
  {
    name: ".NET",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg",
    duration: "10 Weeks",
    description: "Build scalable applications with .NET Core and C#",
    details: "Learn C#, .NET Core, MVC pattern, REST APIs, database integration, deployment, and create enterprise-ready applications.",
    color: "from-purple-400 to-violet-500"
  },
  {
    name: "Flutter",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
    duration: "9 Weeks",
    description: "Create beautiful cross-platform mobile apps with Flutter & Dart",
    details: "Learn Flutter framework, Dart programming, state management, UI design, backend integration, and deploy apps on iOS & Android.",
    color: "from-sky-400 to-blue-500"
  },
  {
    name: "MEAN Stack",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
    duration: "11 Weeks",
    description: "Full-stack JavaScript with MongoDB, Express, Angular, and Node.js",
    details: "Learn Angular for frontend, Node.js + Express for backend, MongoDB database, REST APIs, authentication, deployment, and full-stack projects.",
    color: "from-red-400 to-pink-500"
  },
];

// ---------- Stats ----------
const stats = [
  { icon: Users, value: "5000+", label: "Students Trained" },
  { icon: Award, value: "95%", label: "Placement Rate" },
  { icon: Code2, value: "8+", label: "Tech Stacks" },
  { icon: TrendingUp, value: "4.8/5", label: "Student Rating" }
];

// ---------- Animated Logo Box ----------
const AnimatedLogoBox = ({ src, name, duration, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: parseFloat(delay) }}
    whileHover={{ scale: 1.08 }}
    className="relative w-36 h-36 rounded-2xl mx-auto flex flex-col items-center justify-center bg-white shadow-lg border border-gray-100 overflow-hidden"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 hover:opacity-10 transition-opacity rounded-2xl`}></div>
    <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${color} p-0.5 shadow-lg flex items-center justify-center z-10`}>
      <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
        <img src={src} alt={name} className="w-12 h-12" />
      </div>
    </div>
    <p className="mt-2 text-gray-800 font-semibold text-center">{name}</p>
    <p className="text-xs text-gray-500">{duration}</p>
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
        whileHover={{ y: -10 }}
        className="relative group"
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
          <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${course.color} p-0.5 shadow-lg`}>
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                  <img src={course.src} alt={course.name} className="w-16 h-16" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{course.name}</h3>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">{course.duration}</span>
            </div>
            <p className="text-sm text-gray-600 text-center leading-relaxed">{course.description}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDetails(true)}
              className={`w-full mt-4 py-2 rounded-lg bg-gradient-to-r ${course.color} text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300`}
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal for Detailed Info */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">{course.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{course.duration}</p>
            <p className="text-gray-700 leading-relaxed">{course.details}</p>
          </motion.div>
        </div>
      )}
    </>
  );
};

// ---------- Main Component ----------
const Course = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20 px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
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
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-semibold">Premium Tech Education</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Master the Future of
            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Technology
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your career with industry-leading tech stacks. From full-stack development to AI/ML, we offer comprehensive training programs designed for real-world success.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300"
          >
            Explore Courses
          </motion.button>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Animated Logo Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
           All Domains 
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-10">
          {courseData.map((course, index) => (
            <AnimatedLogoBox
              key={course.name}
              src={course.src}
              name={course.name}
              duration={course.duration}
              color={course.color}
              delay={`${index * 0.2}s`}
            />
          ))}
        </div>
      </div>

      {/* Courses Cards Section */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Explore Our Courses
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our programs with detailed descriptions and learning outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courseData.map((course, index) => (
            <CourseCard key={index} course={course} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Course;
