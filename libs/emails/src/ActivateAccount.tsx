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

interface ActivateAccountProps {
  name: string;
  activationUrl: string;
}

export default function ActivateAccount({
  name,
  activationUrl,
}: ActivateAccountProps) {
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
            Welcome to Our Platform!
          </Heading>

          <Text className="mb-[24px] text-[16px] text-gray-600 leading-[24px]">
            Hi {name},
          </Text>

          <Text className="mb-[24px] text-[16px] text-gray-600 leading-[24px]">
            Thank you for signing up! We're excited to have you on board. To
            complete your account setup and start using our platform, please
            activate your account by clicking the button below.
          </Text>

          <Button
            className="mb-[32px] rounded-[8px] bg-brand px-[32px] py-[16px] text-[16px] font-semibold text-white"
            href={activationUrl}
          >
            Activate Your Account
          </Button>

          <Text className="mb-[16px] text-[14px] text-gray-500 leading-[20px]">
            If the button doesn't work, you can copy and paste this link into
            your browser:
          </Text>

          <Text className="mb-[32px] break-all text-[14px] text-brand leading-[20px]">
            {activationUrl}
          </Text>

          <Hr className="my-[32px] border-gray-200" />

          <Text className="mb-[16px] text-[14px] text-gray-500 leading-[20px]">
            This activation link will expire in 24 hours for security reasons.
          </Text>

          <Text className="text-[14px] text-gray-500 leading-[20px]">
            If you didn't create an account with us, please ignore this email.
          </Text>
        </Section>
      </Container>
    </Tailwind>
  );
}
