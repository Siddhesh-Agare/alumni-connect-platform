import { z } from "zod";
import { text } from "./common.js";

export const sendMessageBody = z.object({
  text: text("Message", { required: true, max: 1000 }),
});
