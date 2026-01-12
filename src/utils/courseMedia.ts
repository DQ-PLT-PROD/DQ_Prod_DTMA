export const getCourseMedia = (item: any) => {
  const videoUrl = item?.introVideoUrl || item?.introVideo?.url;
  const poster =
    item?.introVideoPosterUrl ||
    item?.heroImageUrl ||
    item?.heroImage ||
    item?.imageUrl ||
    item?.thumbnailUrl ||
    item?.thumbnailUrl;

  return { videoUrl, poster };
};

export const getCoursePoster = (item: any) => getCourseMedia(item).poster;
