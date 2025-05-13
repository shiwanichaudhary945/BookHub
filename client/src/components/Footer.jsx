import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">About eBook</h3>
            <p className="text-gray-300 mb-4">
              eBook is your one-stop destination for all your reading needs. We
              offer a vast collection of books across various genres at
              competitive prices.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition duration-150"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition duration-150"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition duration-150"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/bestsellers"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  Bestsellers
                </a>
              </li>
              <li>
                <a
                  href="/new-releases"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  New Releases
                </a>
              </li>
              <li>
                <a
                  href="/offers"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  Deals
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  Coming Soon
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-medium mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/contact"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="/shipping"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  Shipping Information
                </a>
              </li>
              <li>
                <a
                  href="/returns"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin
                  size={20}
                  className="mr-2 mt-1 flex-shrink-0 text-gray-400"
                />
                <span className="text-gray-300">
                  123 Book Street, Reading, RD123 45B
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 flex-shrink-0 text-gray-400" />
                <a
                  href="tel:+1234567890"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 flex-shrink-0 text-gray-400" />
                <a
                  href="mailto:info@ebook.com"
                  className="text-gray-300 hover:text-white transition duration-150"
                >
                  info@ebook.com
                </a>
              </li>
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-2">
                Subscribe to our newsletter
              </h4>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded-l text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} eBook. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white text-sm transition duration-150"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-white text-sm transition duration-150"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/cookie"
                  className="text-gray-400 hover:text-white text-sm transition duration-150"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
