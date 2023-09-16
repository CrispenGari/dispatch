export const __email__: RegExp =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export const __passwords__ = {
  M8L1D1: {
    // Minimum eight characters, at least one letter and one number:
    type: "M8L1D1",
    expression: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  },
  M8L1D1S1: {
    // Minimum eight characters, at least one letter, one number and one special character:
    type: "M8L1D1S1",
    expression:
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
  },
  M8L1U1D1S1: {
    // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number:
    type: "M8L1U1D1S1",
    expression: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  },
};

export const __phoneNumber__: RegExp =
  /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

export const __names__: RegExp =
  /^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/;

export const __username__: RegExp =
  /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

export const isValidEmail = (email: string): boolean => __email__.test(email);
export const isValidUsername = (username: string): boolean =>
  __username__.test(username);
export const isValidPhoneNumber = (phoneNumber: string): boolean =>
  __phoneNumber__.test(phoneNumber);

export const passwordSalts = {
  M8L1D1: "M8L1D1",
  M8L1D1S1: "M8L1D1S1",
  M8L1U1D1S1: "M8L1U1D1S1",
};
// type PasswordType = "M8L1D1" | "M8L1D1S1" | "M8L1U1D1S1";

export const isValidPassword = (
  password: string,
  passwordType: string = "M8L1D1"
): boolean => {
  if (passwordType === passwordSalts.M8L1D1) {
    return __passwords__.M8L1D1.expression.test(password);
  }
  if (passwordType === passwordSalts.M8L1D1S1) {
    return __passwords__.M8L1D1S1.expression.test(password);
  }
  if (passwordType === passwordSalts.M8L1U1D1S1) {
    return __passwords__.M8L1U1D1S1.expression.test(password);
  }
  return false;
};
