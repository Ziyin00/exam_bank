import Link from 'next/link'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'
import { useRouter } from 'next/router'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  // Demo data
  const quickLinks = [
    { title: 'Home', path: '/' },
    { title: 'Courses', path: '/courses' },
    { title: 'About', path: '/about' },
    { title: 'Contact', path: '/contact' },
  ]

  const socialMedia = [
    { icon: <FaFacebook />, path: 'https://facebook.com' },
    { icon: <FaTwitter />, path: 'https://twitter.com' },
    { icon: <FaInstagram />, path: 'https://instagram.com' },
    { icon: <FaLinkedin />, path: 'https://linkedin.com' },
  ]

  const legalLinks = [
    { title: 'Privacy Policy', path: '/privacy' },
    { title: 'Terms of Service', path: '/terms' },
    { title: 'Cookie Policy', path: '/cookies' },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-20 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">EduPlatform</h3>
            <p className="text-sm">
              Empowering learners worldwide with quality education since 2020.
            </p>
            <div className="flex space-x-4">
              {socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:text-indigo-400 transition-colors"
                  aria-label={social.path.split('/')[2]}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.path}
                    className="hover:text-indigo-400 transition-colors text-sm"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.path}
                    className="hover:text-indigo-400 transition-colors text-sm"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <SiGmail />
                <span>support@examBank.com</span>
              </div>
              <p>+1 (555) 123-4567</p>
              <p>123 Education Street</p>
              <p>Knowledge City, LN 56789</p>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h5 className="text-white font-semibold mb-4">
              Subscribe to Our Newsletter
            </h5>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-white font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>
            © {currentYear} ExamBank. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer