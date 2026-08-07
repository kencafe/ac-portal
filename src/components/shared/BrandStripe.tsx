import { GRAD } from "@/lib/tokens";

/** 3px tri-colour brand signature stripe, sticky at the very top (z 61). */
export default function BrandStripe() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 61,
        height: 3,
        background: GRAD.brandStripe,
      }}
    />
  );
}
