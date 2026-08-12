import { listFeatured } from "@/lib/store";
import BlogTeasersView from "@/components/landing/BlogTeasersView";

// Auto-reflects posts published in the CMS.
export default async function BlogTeasers() {
  const posts = await listFeatured(3);
  return <BlogTeasersView posts={posts} />;
}
