// Mock for uuid module
const v4 = () => '123e4567-e89b-12d3-a456-426614174000';
const v1 = () => '123e4567-e89b-12d3-a456-426614174001';

module.exports = {
  v4,
  v1,
  default: {
    v4,
    v1,
  },
};
