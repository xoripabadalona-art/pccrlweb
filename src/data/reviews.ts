export interface CustomerReview {
  id: string;
  author: string;
  date: string;
  text: string;
  permalink: string;
}

/**
 * Hard rule #2: Never invent customer reviews or ratings.
 * This array remains empty until the client pastes real verified Google reviews
 * with author, date, and permalink.
 */
export const customerReviews: CustomerReview[] = [];
