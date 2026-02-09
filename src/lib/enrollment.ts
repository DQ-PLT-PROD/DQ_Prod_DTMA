// Re-export enrollment service functions
export {
    isUserEnrolled,
    enrollInCourse,
    getEnrollment,
    unenrollFromCourse,
    getUserEnrollments,
    getAccessContract,
    type CourseEnrollment,
    type EnrollmentResult,
    type AccessContract
} from './enrollment/service';
