const Footer = () => {
  return (
    <footer className="bg-[#f3f3f3] rounded-t-[30px] md:rounded-t-[40px] px-4 md:px-8 lg:px-16 py-8 md:py-12 overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between gap-8 md:gap-12">
        <div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-tight">
            Experience liftoff
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-8 md:gap-16 text-base md:text-lg">
          <div className="space-y-3 md:space-y-4">
            <a href="#" className="block hover:opacity-70">
              Download
            </a>
            <a href="#" className="block hover:opacity-70">
              Product
            </a>
            <a href="#" className="block hover:opacity-70">
              Docs
            </a>
            <a href="#" className="block hover:opacity-70">
              Changelog
            </a>
            <a href="#" className="block hover:opacity-70">
              Press
            </a>
            <a href="#" className="block hover:opacity-70">
              Releases
            </a>
          </div>

          <div className="space-y-3 md:space-y-4">
            <a href="#" className="block hover:opacity-70">
              Blog
            </a>
            <a href="#" className="block hover:opacity-70">
              Pricing
            </a>
            <a href="#" className="block hover:opacity-70">
              Use Cases
            </a>
          </div>
        </div>
      </div>

      {/* Huge Brand Text */}
      <div className="mt-12 md:mt-20">
        <h1 className="text-[20vw] md:text-[14vw] leading-none font-semibold tracking-tight text-black">
          INTERVIEW_AI
        </h1>
      </div>

      {/* Bottom Bar */}
      <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-gray-600">
        <div className="text-lg md:text-2xl font-medium text-center md:text-left">
          AI Powered Smart Interview Platform
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-lg">
          <a href="#">About</a>
          <a href="#">Courses</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;