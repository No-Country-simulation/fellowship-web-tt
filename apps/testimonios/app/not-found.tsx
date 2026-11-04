import PublicLayout from "./(public)/layout";
import PublicNotFound from "./(public)/not-found";

// Unmatched URLs don't enter (public); matched public notFound() already has its layout.
export default function NotFound() {
  return <PublicLayout><PublicNotFound /></PublicLayout>;
}
