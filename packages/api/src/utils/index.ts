import moment from "moment";
export const expiryDate = (exp: string) => {
  const [a, b] = exp.split(/\s/);
  const value: number = Number.parseInt(a);
  const _value: string = b.trim();
  const date = moment()
    .add(value, _value as any)
    .toDate();
  return date;
};
