// Mock for @react-email/components
module.exports = {
  render: jest.fn().mockResolvedValue('<div>Mocked email content</div>'),
  Section: 'div',
  Text: 'p',
  Heading: 'h1',
  Button: 'button',
  Tailwind: 'div',
  pixelBasedPreset: {},
  Container: 'div',
  Hr: 'hr',
};
