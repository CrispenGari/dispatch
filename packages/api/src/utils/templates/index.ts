import { encode2Base64 } from "@crispengari/utils";
import { join } from "path";
import qrcode from "qrcode";
import { User } from "@prisma/client";

export const verificationEmailTemplate = (
  verificationCode: string,
  user: User
): string => {
  const url = `exp://${
    process.env.IP_ADDRESS
  }:8081/--/profile?code=${encode2Base64(verificationCode)}`;

  qrcode.toFile(
    join(__dirname.replace("dist\\utils\\templates", ""), "code.png"),
    url,
    {
      errorCorrectionLevel: "H",
    },
    function (err) {
      if (err) throw err;
      console.log("QR code saved!");
    }
  );
  qrcode.toString(
    url,
    { type: "terminal", small: true, width: 200 },
    function (err, url) {
      console.log(url);
    }
  );
  return `
  <h1>Hello, ${user.nickname}</h1>
  <p>We have a new account creation request on your email address (${user.email}). If you intent to join <b>Dispatch</b> social application please verify your email by clicking the following link.</p>
  <button>
    <a href="${url}">VERIFY ACCOUNT</a>
  </button>
  <p><em>Note: The verification period only last for an hour.</em></p>
  <p>Regards</p>
  <p>Dispatch Team</p>
`;
};

export const resetPasswordLinkEmailTemplate = (
  value: string,
  user: User
): string => {
  const url = `exp://${
    process.env.IP_ADDRESS
  }:8081/--/resetPassword?token=${encode2Base64(value)}`;
  qrcode.toFile(
    join(__dirname.replace("dist\\utils\\templates", ""), "reset.png"),
    url,
    {
      errorCorrectionLevel: "H",
    },
    function (err) {
      if (err) throw err;
      console.log("QR code saved!");
    }
  );
  qrcode.toString(
    url,
    { type: "terminal", small: true, width: 200 },
    function (err, url) {
      console.log(url);
    }
  );
  return `
  <h1>Hello, ${user.nickname}</h1>
  <p>You have requested to reset your account password, please click the following email to do that.</p>
  <button>
    <a href="${url}">RESET PASSWORD</a>
  </button>
  <p><em>Note: The verification period only last for 2 hours.</em></p>
  <p>Regards</p>
  <p>Dispatch Team</p>
`;
};
