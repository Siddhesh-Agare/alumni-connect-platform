import { BadgeCheck } from "lucide-react";

export default function VerifiedBadge({ className = "" }) {
  return (
    <span title="Verified by admin" className={`inline-flex items-center text-emerald-600 ${className}`}>
      <BadgeCheck size={16} aria-label="Verified by admin" />
    </span>
  );
}
