import React from 'react';

const Review = () => {
  const reviews = [
    { id: 1, reviewer: 'Mentor - Jane Smith', rating: 5, comment: 'Excellent progress on React concepts. Great problem-solving skills!', date: '2024-01-15' },
    { id: 2, reviewer: 'Peer - Mike Johnson', rating: 4, comment: 'Good collaboration on the group project. Clear communication.', date: '2024-01-10' },
    { id: 3, reviewer: 'Mentor - Sarah Wilson', rating: 5, comment: 'Outstanding performance in the database course. Perfect score!', date: '2024-01-05' },
    { id: 4, reviewer: 'Instructor - Alex Brown', rating: 4, comment: 'Good understanding of UI principles. Could improve on design creativity.', date: '2024-01-02' },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews</h2>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Overall Rating</h3>
              <div className="flex items-center mt-1">
                <span className="text-3xl font-bold text-blue-600 mr-2">4.8</span>
                <div className="flex">
                  {renderStars(5)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Based on 12 reviews</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{review.reviewer}</h4>
                  <div className="flex mt-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Review;