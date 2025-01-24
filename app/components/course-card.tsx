// app/components/course-card.tsx
interface CourseProps {
    course: {
      id: number;
      title: string;
      description: string;
      thumbnail_url: string;
      duration_minutes: number;
      enrolled_count: number;
      is_enrolled?: boolean;
      progress?: number;
    };
    onEnroll: () => void;
  }
  
  export function Course({ course, onEnroll }: CourseProps) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <img 
          src={course.thumbnail_url || "/placeholder.jpg"} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{course.description}</p>
          
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <span>{course.duration_minutes} minutes</span>
            <span>{course.enrolled_count} enrolled</span>
          </div>
  
          {course.is_enrolled ? (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${course.progress || 0}%` }}
                />
              </div>
              <a 
                href={`/courses/${course.id}`}
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-md"
              >
                Continue Learning
              </a>
            </div>
          ) : (
            <button
              onClick={onEnroll}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>
    )
  }