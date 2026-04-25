const getWishlistKey = (userId) => `wishlist:${userId}`;

export const getWishlist = (userId) => {
  if (!userId) return [];

  try {
    const raw = localStorage.getItem(getWishlistKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

export const isWishlisted = (userId, jobId) => (
  getWishlist(userId).some((job) => job._id === jobId)
);

export const toggleWishlist = (userId, job) => {
  if (!userId || !job?._id) return [];

  const wishlist = getWishlist(userId);
  const exists = wishlist.some((item) => item._id === job._id);

  const nextWishlist = exists
    ? wishlist.filter((item) => item._id !== job._id)
    : [
        {
          _id: job._id,
          title: job.title,
          specialization: job.specialization,
          salary: job.salary,
          location: job.location,
          type: job.type,
          expiryDate: job.expiryDate,
        },
        ...wishlist,
      ];

  localStorage.setItem(getWishlistKey(userId), JSON.stringify(nextWishlist));
  return nextWishlist;
};
