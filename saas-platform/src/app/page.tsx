import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";
  let preferred = "fr";
  if (acceptLanguage.startsWith("sw")) preferred = "sw";
  else if (acceptLanguage.startsWith("en")) preferred = "en";
  redirect(`/${preferred}`);
}
