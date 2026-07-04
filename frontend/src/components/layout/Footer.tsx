export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-bg">
      <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:px-16 xl:px-24">
        <p className="font-display text-xl text-text">PawMart</p>
        <p className="mt-2 max-w-md font-body text-sm text-muted">
          A small, opinionated pet shop — handpicked food, toys, and care essentials, delivered across Nepal.
        </p>
        <p className="mt-6 font-data text-xs text-muted">© {new Date().getFullYear()} PawMart. All rights reserved.</p>
      </div>
    </footer>
  );
}
