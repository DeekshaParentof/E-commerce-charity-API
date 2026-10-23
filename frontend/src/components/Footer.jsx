function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-sm text-gray-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Charity Shop. Every purchase supports a cause.</p>
        <p>Built with React, Express &amp; MongoDB</p>
      </div>
    </footer>
  );
}

export default Footer;
