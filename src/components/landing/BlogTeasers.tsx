import { listPublished } from "@/lib/store";
import BlogTeasersView from "@/components/landing/BlogTeasersView";

// Auto-reflects posts published in the CMS. Passes all published posts so the
// client view can show the ones matching the active language (VN vs EN page).
export default async function BlogTeasers() {
  const posts = await listPublished();
  return <BlogTeasersView posts={posts} />;
}
