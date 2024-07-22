export const mockAuthDto = {
  email: 'jeff@gmail.com',
  password: '111111',
  subscriptionActive: 'Inactive',
};

export const mockReturnedValue = {
  success: true,
  message: 'Signup successful',
  result: {
    email: 'jeff@gmail.com',
    subscriptionActive: 'Inactive',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};
