import React from "react";
import { Star } from "lucide-react";

const ReviewManagement = () => {
  const reviews = [
    { user: "Aneesh", course: "React", rating: 5, comment: "Very good!" },
    { user: "Rahul", course: "Node.js", rating: 4, comment: "Helpful content" },
    { user: "Sana", course: "Python", rating: 5, comment: "Loved the examples" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Star className="text-yellow-500" /> Review Management
      </h1>
      <div className="bg-white p-4 rounded-xl shadow-md">
        {reviews.map((r, i) => (
          <div key={i} className="border-b py-3">
            <p className="font-semibold">{r.user} - {r.course}</p>
            <p className="text-yellow-600">{"⭐".repeat(r.rating)}</p>
            <p className="text-gray-700">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewManagement;
