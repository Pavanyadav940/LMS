import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

// for creating the courses;
export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "course title and category is required",
      });
    }
    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });

    return res.status(200).json({
      course,
      message: "Course created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create Course",
    });
  }
};

//for searching  the courses
export const searchCourse = async (req, res) => {
  try {
    // Extracting query parameters with default values
    const { query = "", categories = "", sortByPrice = "" } = req.query;

    console.log("Received Categories:", categories); // Debugging

    // Convert categories string to an array (if not already an array)
    const categoryArray = typeof categories === "string" && categories.length > 0 
      ? categories.split(",") 
      : [];

    // Construct search criteria
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } }
      ]
    };

    // Apply category filter if provided
    if (categoryArray.length > 0) {
      searchCriteria.category = { $in: categoryArray };
    } else {
      // If no category filter, allow searching within category names
      searchCriteria.$or.push({ category: { $regex: query, $options: "i" } });
    }

    // Define sorting options
    const sortOptions = {};
    if (sortByPrice === "low") {
      sortOptions.coursePrice = 1; // Ascending
    } else if (sortByPrice === "high") {
      sortOptions.coursePrice = -1; // Descending
    }

    // Fetch courses based on search criteria
    const courses = await Course.find(searchCriteria)
      .populate({ path: "creator", select: "name photoUrl" })
      .sort(sortOptions);

    // Send response
    return res.status(200).json({
      success: true,
      courses: courses || [],
    });

  } catch (error) {
    console.error("Error in searchCourse:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// export const searchCourse = async (req, res) => {
//   try {
//     //  Extracting Query Parameters
//     // req (Request object) → Contains query parameters for searching courses.
//     // res (Response object) → Used to send the JSON response back.
//     // query: Search term for courses. Default is an empty string ("").  jo likha hoga search input me vo he wo search karega
//     // categories: An array of selected categories. Default is an empty array ([]).
//     // sortByPrice: Sorting preference for course prices (e.g., "low" or "high"). Default is empty string ("").
//     const { query = "", categories = [], sortByPrice = "" } = req.query;
//     console.log(categories,"pavan");

//     // create search query
//     const searchCriteria = {
//       isPublished: true,  
//       $or: [
//         { courseTitle: { $regex: query, $options: "i" } },
//         { subTitle: { $regex: query, $options: "i" } },
//         { category: { $regex: query, $options: "i" } },
//       ],
//     };

//     // if categories selected 
//     if (categories.length > 0) {
//       searchCriteria.category = { $in: categories };
//     }

//     // define sorting order
//     const sortOptions = {};
//     if (sortByPrice === "low") {
//       sortOptions.coursePrice = 1; //sort by price in ascending
//     } else if (sortByPrice === "high") {
//       sortOptions.coursePrice = -1; // descending
//     }

//     let courses = await Course.find(searchCriteria)
//       .populate({ path: "creator", select: "name photoUrl" })
//       .sort(sortOptions);

//     return res.status(200).json({
//       success: true,
//       courses: courses || [],
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// for getting the course that are published for showing it on the ui
export const getPublishedCourses = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({
      path: "creator",
      select: "name photoUrl",
    });

    if (!courses) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed To fetch Published Courses",
    });
  }
};

// for fetching all courses of creators
export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "Course not found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};

//for updating the courses
export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;

    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course Not Found",
      });
    }

    //  first we have to delete the previous thumbnail from the course  for that we use cloudinary wala jo humne kia he pehle hi
    let courseThumbnail;
    if (thumbnail) {
      //ye if ki jo change wale ke lia he ki user change karna chahta he i nhi
      // pehle delete karo then upload karo
      if (course.courseThumbnail) {
        //ye if ki jo course ke lia he ki pehle se he ki nhi course ke andar thumbnail
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      //  upload karo
      courseThumbnail = await uploadMedia(thumbnail.path);
    }

    //  update the rest data

    const updatedData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      courseThumbnail: courseThumbnail?.secure_url,
    };

    course = await Course.findByIdAndUpdate(courseId, updatedData, {
      new: true,
    });

    return res.status(200).json({
      course,
      message: "Course Updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failef to Update Course",
    });
  }
};

// export const editCourse = async (req,res) => {
//   try {
//       const courseId = req.params.courseId;
//       const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;
//       const thumbnail = req.file;

//       let course = await Course.findById(courseId);
//       if(!course){
//           return res.status(404).json({
//               message:"Course not found!"
//           })
//       }
//       let courseThumbnail;
//       if(thumbnail){
//           if(course.courseThumbnail){
//               const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
//               await deleteMediaFromCloudinary(publicId); // delete old image
//           }
//           // upload a thumbnail on clourdinary
//           courseThumbnail = await uploadMedia(thumbnail.path);
//       }

//       const updateData = {courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail:courseThumbnail?.secure_url};

//       course = await Course.findByIdAndUpdate(courseId, updateData, {new:true});

//       return res.status(200).json({
//           course,
//           message:"Course updated successfully."
//       })

//   } catch (error) {
//       console.log(error);
//       return res.status(500).json({
//           message:"Failed to create course"
//       })
//   }
// }

//for getting the courses by ids
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "course Not Found",
      });
    }
    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get the Course by Id",
    });
  }
};

// controllers for the lectures

// for creating the lecture
export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;
    if (!lectureTitle || !courseId) {
      return res.status(404).json({
        message: "lecture Title is required ",
      });
    }

    const lecture = await Lecture.create({ lectureTitle });

    const course = await Course.findById(courseId);
    if (course) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(201).json({
      lecture,
      message: "Lecture created succesfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Create a Lecture",
    });
  }
};

// for getting the lectures of particular course;
export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      lectures: course.lectures,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lectures",
    });
  }
};

// for editting  the lectures of particular course;
export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;

    const { courseId, lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }

    // update lecture
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
    lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    // Ensure the course still has the lecture id if it was not aleardy added;
    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(200).json({
      lecture,
      message: "Lecture updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to edit lectures",
    });
  }
};

// for removing the lectures of particular course;
export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }
    // delete the lecture from couldinary as well
    if (lecture.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }

    // Remove the lecture reference from the associated course
    await Course.updateOne(
      { lectures: lectureId }, // find the course that contains the lecture
      { $pull: { lectures: lectureId } } // Remove the lectures id from the lectures array
    );

    return res.status(200).json({
      message: "Lecture removed successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to remove lecture",
    });
  }
};
// for getting the lectures of particular course;
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }
    return res.status(200).json({
      lecture,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lecture by id",
    });
  }
};

// for publish and unpublish course lecture
export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query; // true, false
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    // publish status based on the query paramter
    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({
      message: `Course is ${statusMessage}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update status",
    });
  }
};
