import logo from "@/assets/logo-mark.png";

/** Primary brand emblem. Swap the asset file to update it everywhere. */
export function Logo({ className = "size-10" }: { className?: string }) {
  return <img src={logo} alt="" aria-hidden width={816} height={816} className={`${className} shrink-0 object-contain`} />;
}
