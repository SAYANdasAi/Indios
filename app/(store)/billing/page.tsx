'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface BillingFormData {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: number;
  phone: number;
}

export default function BillingPage() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [formData, setFormData] = useState<BillingFormData>({
    fullName: user?.fullName || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: 0,
    phone: 0
  });

  useEffect(() => {
    // Generate a numeric order ID if not provided
    if (!orderId) {
      const numericOrderId = Date.now().toString();
      router.push(`/billing?orderId=${numericOrderId}`);
    }
  }, [orderId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store billing info in sessionStorage for payment page
    sessionStorage.setItem('billingAddress', JSON.stringify(formData));
    // Proceed to payment
    router.push(`/payment?orderId=${orderId}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'postalCode' || name === 'phone' ? Number(value) || 0 : value
    }));
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Billing Address</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500"
            />
          </div>

          <div>
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500"
            />
          </div>

          <div>
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="number"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode || ''}
                onChange={handleInputChange}
                required
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="number"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                required
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Proceed to Payment
        </button>
      </form>
    </div>
  );
}
