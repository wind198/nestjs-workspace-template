/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Section,
  Text,
  Heading,
  Button,
  Tailwind,
  pixelBasedPreset,
  Container,
  Hr,
} from '@react-email/components';
import { BRAND_COLOR } from './colors';

interface ResetPasswordProps {
  name: string;
  resetPasswordUrl: string;
}

export default function ResetPassword({
  name,
  resetPasswordUrl,
}: ResetPasswordProps) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: BRAND_COLOR,
            },
          },
        },
      }}
    >
      <Container className="mx-auto max-w-[600px] bg-white p-[32px]">
        <Section className="text-center">
          <Heading
            as="h1"
            className="mb-[24px] text-[32px] font-bold text-gray-900 leading-[40px]"
          >
            Reset Your Password
          </Heading>

          <Text className="mb-[24px] text-[16px] text-gray-600 leading-[24px]">
            Hi {name},
          </Text>

          <Text className="mb-[24px] text-[16px] text-gray-600 leading-[24px]">
            We received a request to reset your password. If you made this
            request, click the button below to create a new password. If you
            didn't request this, you can safely ignore this email.
          </Text>

          <Button
            className="mb-[32px] rounded-[8px] bg-brand px-[32px] py-[16px] text-[16px] font-semibold text-white"
            href={resetPasswordUrl}
          >
            Reset My Password
          </Button>

          <Text className="mb-[16px] text-[14px] text-gray-500 leading-[20px]">
            If the button doesn't work, you can copy and paste this link into
            your browser:
          </Text>

          <Text className="mb-[32px] break-all text-[14px] text-brand leading-[20px]">
            {resetPasswordUrl}
          </Text>

          <Hr className="my-[32px] border-gray-200" />

          <Text className="mb-[16px] text-[14px] text-gray-500 leading-[20px]">
            This password reset link will expire in 1 hour for security reasons.
          </Text>

          <Text className="text-[14px] text-gray-500 leading-[20px]">
            If you didn't request a password reset, please ignore this email.
            Your password will remain unchanged.
          </Text>
        </Section>
      </Container>
    </Tailwind>
  );
}
