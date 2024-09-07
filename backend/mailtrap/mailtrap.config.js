import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

//const TOKEN = process.env.MAILTRAP_TOKEN
//const ENDPOINT = process.env.MAILTRAP_ENDPOINT
 const TOKEN = "5a4a8176900b57e291245e2370ec3e29"
 const ENDPOINT = "https://send.api.mailtrap.io"
console.log(TOKEN)
console.log(ENDPOINT)

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
  endpoint:ENDPOINT
});

 export const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Mailtrap Test",
};
