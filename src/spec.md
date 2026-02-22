# Specification

## Summary
**Goal:** Add a product reviews and ratings system allowing buyers to rate and review products they've purchased.

**Planned changes:**
- Add Review data model to backend with rating (1-5 stars), comment, buyer info, and timestamp
- Implement backend functions to create reviews (with purchase verification) and retrieve product reviews with average ratings
- Display reviews and ratings on ProductDetail page with star visualization, reviewer names, and comments
- Show average star ratings and review counts on ProductCard components in catalog and search results
- Add review submission form on ProductDetail page for authenticated buyers who purchased the product
- Create React Query hooks for fetching reviews and submitting new reviews
- Build reusable star rating components (read-only display and interactive input) using warm earth tone design

**User-visible outcome:** Buyers can view product ratings and reviews on product cards and detail pages, and submit their own ratings and reviews for products they've purchased. Average ratings help inform purchase decisions.
