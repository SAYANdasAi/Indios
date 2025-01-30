"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* About Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">About Indios</h3>
                    <p className="text-gray-400">
                        Your one-stop destination for quality products at great prices.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/about" className="text-gray-400 hover:text-white">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="text-gray-400 hover:text-white">
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link href="/faq" className="text-gray-400 hover:text-white">
                                FAQ
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Customer Service */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/shipping" className="text-gray-400 hover:text-white">
                                Shipping Info
                            </Link>
                        </li>
                        <li>
                            <Link href="/returns" className="text-gray-400 hover:text-white">
                                Returns
                            </Link>
                        </li>
                        <li>
                            <Link href="/orders" className="text-gray-400 hover:text-white">
                                Order Status
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li>Email: support@indios.com</li>
                        <li>Phone: 1-800-123-4567</li>
                        <li>Address: 123 Store Street, City, State 12345</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Indios. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
