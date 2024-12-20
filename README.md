# Indios E-commerce Platform

![Indios E-commerce Platform](https://raw.githubusercontent.com/your-username/indios/main/public/cover.png)

A modern e-commerce platform built with Next.js 14, Sanity CMS, and Clerk Authentication. Features a WhatsApp-based payment system and intelligent product recommendations.

🌐 [Live Demo](https://indios.vercel.app) | 📚 [Sanity Studio](https://indios.sanity.studio) 

## Features

### 1. User Authentication & Management
- Secure user authentication with Clerk
- User profile management
- Order history tracking
- Personalized shopping experience

### 2. Product Management
- Dynamic product catalog
- Rich product details with images
- Category-based organization
- Real-time inventory tracking
- Product search and filtering

### 3. Smart Recommendations
Our recommendation system uses a sophisticated scoring algorithm to suggest products based on user behavior and product relationships.

#### How It Works

1. **Data Collection**
```typescript
// Fetch user's order history with product categories
const orders = await client.fetch<Order[]>(`
    *[_type == "order" && clerkUserId == $userId] {
        _id,
        products[] {
            product->{
                _id,
                categories[]->{
                    _id,
                    name
                },
                name,
                price,
                image
            },
            quantity
        }
    }
`);
```

2. **Category Analysis**
```typescript
// Create frequency map of purchased categories
const categoryFrequency: { [key: string]: number } = {};
orders.forEach(order => {
    order.products.forEach(item => {
        item.product.categories?.forEach(category => {
            categoryFrequency[category._id] = 
                (categoryFrequency[category._id] || 0) + item.quantity;
        });
    });
});
```

3. **Scoring System**
```typescript
const scoredProducts = availableProducts.map((product: any) => {
    let score = 0;

    // Category matching score (3 points per match)
    product.categories?.forEach((category: any) => {
        if (currentProductCategories.some(cc => cc._id === category._id)) {
            score += 3;
        }
    });

    // Purchase history score (0.5 points per previous purchase)
    product.categories?.forEach((category: any) => {
        score += (categoryFrequency[category._id] || 0) * 0.5;
    });

    return { ...product, score };
});
```

4. **Implementation**
```typescript
// ProductRecommendations.tsx
export default function ProductRecommendations({ currentProductId }: Props) {
    const { user } = useUser();
    const [recommendations, setRecommendations] = useState<Product[]>([]);

    useEffect(() => {
        if (!user) return;
        const params = new URLSearchParams({
            userId: user.id,
            productId: currentProductId
        });
        fetch(`/api/recommendations?${params}`)
            .then(res => res.json())
            .then(data => setRecommendations(data.recommendations));
    }, [user, currentProductId]);

    return (
        <div className="grid grid-cols-4 gap-4">
            {recommendations.map(product => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
}
```

### 4. Shopping Cart
- Real-time cart updates
- Persistent cart storage
- Quantity management
- Price calculations with subtotal
- Cart item removal

### 5. Order Processing
- Unique order ID generation
- Multiple payment options
  - WhatsApp-based payment
  - UPI payment integration
- Order status tracking:
  - Pending
  - Processing
  - Paid
  - Shipped
  - Delivered
  - Cancelled
- Detailed order confirmation

### 6. Billing & Shipping
- Address management
- Form validation
- Multiple address support
- Shipping details in WhatsApp message

### 7. Admin Features (Sanity Studio)
- Product management
- Order tracking
- Inventory updates
- Category management
- Order status updates

### 8. WhatsApp Integration System

Our WhatsApp integration provides a seamless payment and communication system.

#### Order Processing Flow

1. **Order Creation**
```typescript
// Create order in Sanity
const orderData = {
    _type: 'order',
    orderNumber: orderId,
    orderDate: new Date().toISOString(),
    status: 'pending',
    totalPrice: total,
    paymentMethod: 'whatsapp',
    paymentId: whatsappPaymentId,
    clerkUserId: userId,
    products: items.map(item => ({
        _type: 'object',
        product: {
            _type: 'reference',
            _ref: item.product._id,
        },
        quantity: item.quantity
    }))
};
```

2. **WhatsApp Message Generation**
```typescript
const message = `
Order #${orderId}
Name: ${billingAddress?.fullName}
Email: ${userEmail}

Shipping Address:
${billingAddress?.addressLine1}
${billingAddress?.city}, ${billingAddress?.state}
${billingAddress?.postalCode}

Items:
${items.map(item => 
    `${item.product.name} x${item.quantity} - ₹${item.product.price * item.quantity}`
).join('\n')}

Total Amount: ₹${total}
Payment Status: Processing
`;
```

3. **WhatsApp Link Generation**
```typescript
const phoneNumber = process.env.NEXT_PUBLIC_YOUR_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '');
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
window.open(whatsappUrl, '_blank');
```

4. **Status Updates**
```typescript
// Update order status
await client
    .patch(orderId)
    .set({ status: 'processing' })
    .commit();
```

#### Integration Features
- Automated order message generation
- Direct WhatsApp chat opening
- Order status tracking
- Payment confirmation
- Rich message formatting
- Error handling

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **CMS**: Sanity.io
- **Authentication**: Clerk
- **Database**: Sanity Dataset
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: React Context
- **Image Handling**: Next.js Image Optimization
- **Payment**: WhatsApp & UPI Integration

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_sanity_token
   
   NEXT_PUBLIC_YOUR_WHATSAPP_NUMBER=your_whatsapp
   NEXT_PUBLIC_YOUR_UPI_ID=your_upi_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Start Sanity Studio:
   ```bash
   npm run sanity-dev
   ```

## Deployment

1. Deploy the Next.js app on Vercel
2. Deploy Sanity Studio
3. Configure environment variables
4. Set up proper authentication redirects

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email] or join our Slack channel.
