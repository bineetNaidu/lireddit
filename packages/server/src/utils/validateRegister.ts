import { UserPasswordInput } from './UserPasswordInput';

export const validateRegister = (options: UserPasswordInput) => {
  if (options.username.length <= 2) {
    return [
      {
        field: 'username',
        message: 'Username is too short!',
      },
    ];
  }

  if (options.password.length <= 6) {
    return [
      {
        field: 'password',
        message: 'password is too short!',
      },
    ];
  }

  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email!',
      },
    ];
  }

  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'prefered Not to use "@" in username',
      },
    ];
  }

  return null;
};
