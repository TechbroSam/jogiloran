// emails/OrderConfirmationEmail.tsx

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderConfirmationEmailProps {
  orderId: string;
  orderDate: string;
  totalAmount: string;
  shippingAddress: {
    name: string;
    address: {
      line1: string;
      line2?: string | null;
      city: string;
      postal_code: string;
      country: string;
    };
  };
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

const baseUrl = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}`
  : '';

export const OrderConfirmationEmail = ({
  orderId,
  orderDate,
  totalAmount,
  shippingAddress,
  products,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Axion Leather Order Confirmation</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
            <Text style={h1}>Axion Leather</Text>
        </Section>
        <Heading style={heading}>Thanks for your order!</Heading>
        <Text style={paragraph}>
          We're getting your order ready and will notify you once it has shipped.
        </Text>
        <Hr style={hr} />
        <Section>
          <Text style={subheading}>Order Details</Text>
          <Text style={details}>
            <strong>Order ID:</strong> ...{orderId.slice(-6)}
            <br />
            <strong>Order Date:</strong> {orderDate}
            <br />
            <strong>Order Total:</strong> £{totalAmount}
          </Text>
        </Section>
        <Hr style={hr} />
        <Section>
            <Text style={subheading}>Shipping to</Text>
            <Text style={address}>
                {shippingAddress.name}<br />
                {shippingAddress.address.line1}<br />
                {shippingAddress.address.line2 && <>{shippingAddress.address.line2}<br /></>}
                {shippingAddress.address.city}, {shippingAddress.address.postal_code}<br />
                {shippingAddress.address.country}
            </Text>
        </Section>
        <Hr style={hr} />
        <Section>
          <Text style={subheading}>Items</Text>
          {products.map((product, index) => (
            <Section key={index} style={itemSection}>
                <Text style={itemText}>
                    {product.name} (x{product.quantity})
                </Text>
                <Text style={itemPrice}>
                    £{(product.price * product.quantity).toFixed(2)}
                </Text>
            </Section>
          ))}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Axion Leather, 123 Craft Street, Manchester, UK
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

// --- STYLES ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Helvetica,Arial,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
};

const logoContainer = {
    textAlign: 'center' as const,
    padding: '20px 0',
}

const h1 = {
  color: '#1d1d1f',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#333',
};

const subheading = {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '16px 0 8px 20px',
    color: '#333',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  color: '#555',
  padding: '0 20px',
};

const details = {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#555',
    padding: '0 20px',
}

const address = {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#555',
    padding: '0 20px',
}

const itemSection = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
}

const itemText = {
    fontSize: '14px',
    color: '#555',
}

const itemPrice = {
    fontSize: '14px',
    color: '#333',
    fontWeight: 'bold' as const,
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
};