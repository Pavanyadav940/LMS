import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import React from "react";
import { Link } from "react-router-dom";

const Course = ({ course }) => {
  console.log(course);
  return (
   
        <Link to={`/course-detail/${course._id}`}>
    <div>
      <Card className="rounded-lg dark:border-r-gray-800  shadow-lg hover:shadow-2xl tranform hover:scale-105 transition-all duration-300">
        <div className="relative">
          <img
            src={course.courseThumbnail}
            alt="Course"
            className="w-full h-36 object-cover rounded-t-lg"
          />
        </div>
        <CardContent className="px-5 py-4 space-y-3">
          <h1 className="font-bold hover:underline text-lg truncate">
            {course.courseTitle}
          </h1>
          <div className="flex justify-between">
            <div className="flex gap-5 items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    course.creator?.photoUrl || "https://github.com/shadcn.png"
                  }
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p>{course.creator?.name}</p>
            </div>
            <div>
              <Badge
                className={
                  "bg-blue-600 text-white px-2 py-1 text-xs rounded-full"
                }
              >
                {" "}
                {course.courseLevel}
              </Badge>
            </div>
          </div>
          <div className="text-lg font-bold">
            <span>₹{course.coursePrice}</span>
          </div>
        </CardContent>
      </Card>
    </div>
    </Link>
  );
};

export default Course;
