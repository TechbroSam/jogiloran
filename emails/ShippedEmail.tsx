// emails/ShippedEmail.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ShippedEmailProps {
  orderId: string;
  shippedDate: string;
}

export const ShippedEmail = ({ orderId, shippedDate }: ShippedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Artisan Leather Order has Shipped!</Preview>
    <Body style={{ fontFamily: 'Helvetica, Arial, sans-serif', backgroundColor: '#f6f9fc' }}>
      <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', borderRadius: '8px' }}>
        <Heading style={{ fontSize: '24px', textAlign: 'center' }}>Your Order is on its way!</Heading>
        <Text style={{ fontSize: '16px', textAlign: 'center' }}>
          Great news! Your order from Artisan Leather has been shipped on {shippedDate}.
        </Text>
        <Text style={{ fontSize: '16px', textAlign: 'center' }}>
          <strong>Order ID:</strong> ...{orderId.slice(-6)}
        </Text>
        <Text style={{ fontSize: '14px', textAlign: 'center', color: '#8898aa' }}>
          You can view your order details by logging into your account.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ShippedEmail;